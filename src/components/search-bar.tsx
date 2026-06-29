"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

type SearchDoc = { title: string; category: string; href: string; body: string };

type Result = SearchDoc & { snippet: string | null };

function makeSnippet(body: string, term: string): string | null {
  const i = body.toLowerCase().indexOf(term);
  if (i === -1) return null;
  const start = Math.max(0, i - 40);
  const end = Math.min(body.length, i + term.length + 70);
  return (start > 0 ? "…" : "") + body.slice(start, end).trim() + (end < body.length ? "…" : "");
}

export function SearchBar() {
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Load the full-text index once, on first focus.
  async function ensureIndex() {
    if (docs) return;
    try {
      const res = await fetch("/api/search-index");
      if (res.ok) setDocs(await res.json());
      else setDocs([]);
    } catch {
      setDocs([]);
    }
  }

  const results = useMemo<Result[]>(() => {
    const term = q.trim().toLowerCase();
    if (!term || !docs) return [];
    return docs
      .filter(
        (d) =>
          d.title.toLowerCase().includes(term) ||
          d.category.toLowerCase().includes(term) ||
          d.body.toLowerCase().includes(term),
      )
      .slice(0, 8)
      .map((d) => ({
        ...d,
        // Show a body snippet only when the match isn't already in the title.
        snippet: d.title.toLowerCase().includes(term) ? null : makeSnippet(d.body, term),
      }));
  }, [q, docs]);

  useEffect(() => {
    setOpen(false);
    setQ("");
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ensureIndex();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "Enter" && results.length > 0) {
      router.push(results[0].href);
    }
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-card/50 px-3 py-1.5 backdrop-blur-xl">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-muted" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            ensureIndex();
            setOpen(true);
          }}
          onKeyDown={onInputKey}
          placeholder="Search notes…"
          aria-label="Search notes"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
        />
        <kbd className="hidden shrink-0 rounded border border-border/70 px-1.5 py-0.5 text-[10px] text-muted sm:block">
          ⌘K
        </kbd>
      </div>

      {open && q.trim() && (
        <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl border border-foreground/10 bg-card/80 shadow-xl backdrop-blur-2xl">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">
              {docs ? `No matches for “${q.trim()}”.` : "Loading…"}
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1 text-sm">
              {results.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2 transition-colors hover:bg-accent-soft"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-medium text-foreground">{it.title}</span>
                      <span className="shrink-0 text-xs text-muted">{it.category}</span>
                    </div>
                    {it.snippet && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted">{it.snippet}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
