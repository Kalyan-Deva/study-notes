"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { Markdown } from "@/components/markdown";
import type { JournalEntry, JournalNote } from "@/lib/supabase/types";

function newId() {
  // Browser-only component, so crypto.randomUUID is available.
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
}

export function JournalComposer({ note }: { note?: JournalNote }) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [entries, setEntries] = useState<JournalEntry[]>(note?.entries ?? []);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const feedEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Keep the newest entry in view as the stream grows.
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length]);

  // ── Sending entries up into the feed ──────────────────────────────────────
  function commitDraft() {
    const md = draft.trim();
    if (!md) return;
    setEntries((e) => [...e, { id: newId(), md }]);
    setDraft("");
    setDirty(true);
    requestAnimationFrame(() => taRef.current?.focus());
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Ctrl+Enter (or Cmd+Enter) sends the line up; plain Enter = newline.
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      commitDraft();
    }
  }

  function removeEntry(id: string) {
    setEntries((e) => e.filter((x) => x.id !== id));
    setDirty(true);
  }

  // ── Markdown formatting helpers (operate on the textarea selection) ────────
  function wrapSelection(before: string, after = before) {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = draft.slice(start, end) || "text";
    const next = draft.slice(0, start) + before + sel + after + draft.slice(end);
    setDraft(next);
    setDirty(true);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + sel.length;
    });
  }

  function prefixLines(makePrefix: (lineIndex: number) => string) {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const lineStart = draft.lastIndexOf("\n", start - 1) + 1;
    const after = draft.indexOf("\n", end);
    const lineEnd = after === -1 ? draft.length : after;
    const segment = draft.slice(lineStart, lineEnd);
    const prefixed = segment
      .split("\n")
      .map((line, i) => makePrefix(i) + line)
      .join("\n");
    const next = draft.slice(0, lineStart) + prefixed + draft.slice(lineEnd);
    setDraft(next);
    setDirty(true);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = lineStart;
      ta.selectionEnd = lineStart + prefixed.length;
    });
  }

  function applyFormat(value: string) {
    if (value === "h1") prefixLines(() => "# ");
    else if (value === "h2") prefixLines(() => "## ");
    else if (value === "h3") prefixLines(() => "### ");
    else if (value === "quote") prefixLines(() => "> ");
  }

  // ── Saving ─────────────────────────────────────────────────────────────────
  async function save() {
    setSaving(true);
    setErr(null);

    // Don't lose text left sitting in the box — fold it into the stream first.
    const pending = draft.trim();
    const finalEntries = pending
      ? [...entries, { id: newId(), md: pending }]
      : entries;

    const supabase = createSupabaseBrowser();
    const payload = { title: title.trim() || "Untitled", entries: finalEntries };
    const res = note
      ? await supabase
          .from("journal_notes")
          .update(payload)
          .eq("id", note.id)
          .select("id")
          .single()
      : await supabase
          .from("journal_notes")
          .insert(payload)
          .select("id")
          .single();

    setSaving(false);
    if (res.error) {
      setErr(res.error.message);
      return;
    }

    setEntries(finalEntries);
    setDraft("");
    setDirty(false);

    if (!note && res.data?.id) {
      router.replace(`/journal/${res.data.id}`);
    }
    router.refresh();
  }

  async function removeNote() {
    if (!note) return;
    if (!window.confirm("Delete this note? This can't be undone.")) return;
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.from("journal_notes").delete().eq("id", note.id);
    if (error) {
      setErr(error.message);
      return;
    }
    router.push("/journal");
    router.refresh();
  }

  const toolBtn =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm text-muted transition-colors hover:bg-background hover:text-foreground";

  return (
    <div className="flex min-h-[calc(100vh-9rem)] flex-col">
      {/* Top bar: back link, title, save / delete */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link
          href="/journal"
          className="rounded-lg border border-border px-2.5 py-2 text-sm text-muted transition-colors hover:text-foreground"
          aria-label="Back to journal"
        >
          ←
        </Link>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setDirty(true);
          }}
          placeholder="Note title"
          className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2 text-lg font-semibold outline-none focus:border-accent"
        />
        {dirty && (
          <span className="text-xs text-muted" title="Unsaved changes">
            ● Unsaved
          </span>
        )}
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {note && (
          <button
            type="button"
            onClick={removeNote}
            className="rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
          >
            Delete
          </button>
        )}
      </div>

      {err && <p className="mb-3 text-sm text-accent">{err}</p>}

      {/* Feed of entries — flows upward; pad the bottom so the composer never covers it */}
      <div className="flex-1 space-y-3 pb-44">
        {entries.length === 0 ? (
          <p className="text-sm text-muted">
            Nothing yet. Write below and press{" "}
            <kbd className="rounded border border-border px-1">Ctrl</kbd>+
            <kbd className="rounded border border-border px-1">Enter</kbd> to add it.
          </p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="group relative rounded-xl border border-card-border bg-card/60 px-4 py-2"
            >
              <Markdown>{entry.md}</Markdown>
              <button
                type="button"
                onClick={() => removeEntry(entry.id)}
                aria-label="Delete entry"
                className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-md text-muted transition-colors hover:bg-background hover:text-foreground group-hover:flex"
              >
                ✕
              </button>
            </div>
          ))
        )}
        <div ref={feedEndRef} />
      </div>

      {/* Composer fixed at the bottom center */}
      <div className="fixed bottom-4 left-1/2 z-30 w-[min(42rem,calc(100vw-2rem))] -translate-x-1/2">
        <div className="glass-edge rounded-2xl border border-foreground/10 bg-card/80 p-2 shadow-xl backdrop-blur-2xl backdrop-saturate-150">
          {/* Toolbar */}
          <div className="mb-1.5 flex flex-wrap items-center gap-1 px-1">
            <button type="button" className={toolBtn} title="Bold (**)" onClick={() => wrapSelection("**")}>
              <strong>B</strong>
            </button>
            <button type="button" className={toolBtn} title="Italic (*)" onClick={() => wrapSelection("*")}>
              <em>I</em>
            </button>
            <button type="button" className={toolBtn} title="Inline code (`)" onClick={() => wrapSelection("`")}>
              <code className="text-xs">{"</>"}</code>
            </button>
            <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
            <button type="button" className={toolBtn} title="Bullet list" onClick={() => prefixLines(() => "- ")}>
              • List
            </button>
            <button
              type="button"
              className={toolBtn}
              title="Numbered list"
              onClick={() => prefixLines((i) => `${i + 1}. `)}
            >
              1. List
            </button>
            <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
            <select
              aria-label="Format style"
              defaultValue=""
              onChange={(e) => {
                applyFormat(e.target.value);
                e.target.value = "";
              }}
              className="h-8 rounded-md bg-transparent px-1 text-sm text-muted outline-none hover:text-foreground"
            >
              <option value="" disabled>
                Style…
              </option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="quote">Quote</option>
            </select>
          </div>

          <textarea
            ref={taRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            placeholder="Write a note…  (Ctrl+Enter to add it above)"
            className="max-h-40 min-h-[2.75rem] w-full resize-none rounded-xl bg-transparent px-3 py-2 text-sm leading-relaxed outline-none"
          />

          <div className="flex items-center justify-between px-2 pb-1">
            <span className="text-[11px] text-muted">
              <kbd className="rounded border border-border px-1">Ctrl</kbd>+
              <kbd className="rounded border border-border px-1">Enter</kbd> to add
            </span>
            <button
              type="button"
              onClick={commitDraft}
              disabled={!draft.trim()}
              className="rounded-lg bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent transition-opacity disabled:opacity-50"
            >
              Add ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
