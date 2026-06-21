"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import type { NavCategory } from "@/lib/types";

type Item = { slug: string; title: string; category: string; summary: string; href: string };

export function SearchBar({ tree }: { tree: NavCategory[] }) {
  const items = useMemo<Item[]>(
    () =>
      tree.flatMap((g) =>
        g.notes.map((n) => ({
          slug: n.slug,
          title: n.title,
          category: g.category,
          summary: n.summary,
          href: n.href ?? `/notes/${n.slug}`,
        })),
      ),
    [tree],
  );

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return items
      .filter(
        (it) =>
          it.title.toLowerCase().includes(term) ||
          it.category.toLowerCase().includes(term) ||
          it.summary.toLowerCase().includes(term),
      )
      .slice(0, 8);
  }, [q, items]);

  // Close + clear on navigation.
  useEffect(() => {
    setOpen(false);
    setQ("");
  }, [pathname]);

  // Close on click outside.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Cmd/Ctrl+K to focus.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
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
          onFocus={() => setOpen(true)}
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
            <p className="px-4 py-3 text-sm text-muted">No matches for “{q.trim()}”.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1 text-sm">
              {results.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline justify-between gap-3 px-4 py-2 transition-colors hover:bg-accent-soft"
                  >
                    <span className="font-medium text-foreground">{it.title}</span>
                    <span className="shrink-0 text-xs text-muted">{it.category}</span>
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
