"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Markdown } from "@/components/markdown";
import type { JournalEntry, JournalNote } from "@/lib/supabase/types";

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
}

export function JournalComposer({
  note,
  canEdit,
}: {
  note?: JournalNote;
  canEdit: boolean;
}) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [entries, setEntries] = useState<JournalEntry[]>(note?.entries ?? []);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const feedEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length]);

  function commitDraft() {
    const md = draft.trim();
    if (!md) return;
    setEntries((e) => [...e, { id: newId(), md }]);
    setDraft("");
    setDirty(true);
    requestAnimationFrame(() => taRef.current?.focus());
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      commitDraft();
    }
  }

  function removeEntry(id: string) {
    setEntries((e) => e.filter((x) => x.id !== id));
    setDirty(true);
  }

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

  async function save() {
    setSaving(true);
    setErr(null);
    const pending = draft.trim();
    const finalEntries = pending ? [...entries, { id: newId(), md: pending }] : entries;

    const url = note ? `/api/journal/${note.id}` : "/api/journal";
    const res = await fetch(url, {
      method: note ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: title.trim() || "Untitled", entries: finalEntries }),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setErr(json.error ?? "Could not save.");
      return;
    }

    setEntries(finalEntries);
    setDraft("");
    setDirty(false);
    if (!note && json.id) router.replace(`/journal/${json.id}`);
    router.refresh();
  }

  async function removeNote() {
    if (!note) return;
    if (!window.confirm("Delete this note? This can't be undone.")) return;
    const res = await fetch(`/api/journal/${note.id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setErr(json.error ?? "Could not delete.");
      return;
    }
    router.push("/journal");
    router.refresh();
  }

  const toolBtn =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm text-muted transition-colors hover:bg-background hover:text-foreground";

  return (
    <div className="flex min-h-[calc(100vh-9rem)] flex-col">
      {/* Top bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link
          href="/journal"
          className="rounded-lg border border-border px-2.5 py-2 text-sm text-muted transition-colors hover:text-foreground"
          aria-label="Back to journal"
        >
          ←
        </Link>
        {canEdit ? (
          <>
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
          </>
        ) : (
          <h1 className="min-w-0 flex-1 truncate text-lg font-semibold">
            {title || "Untitled"}
          </h1>
        )}
      </div>

      {err && <p className="mb-3 text-sm text-accent">{err}</p>}

      {!canEdit && (
        <p className="mb-4 rounded-lg border border-card-border bg-card/60 px-4 py-2 text-sm text-muted">
          Editing is locked.{" "}
          <Link href="/edit-access" className="text-accent hover:underline">
            Unlock with an edit token →
          </Link>
        </p>
      )}

      {/* Feed */}
      <div className={`flex-1 space-y-3 ${canEdit ? "pb-44" : "pb-8"}`}>
        {entries.length === 0 ? (
          <p className="text-sm text-muted">
            {canEdit ? (
              <>
                Nothing yet. Write below and press{" "}
                <kbd className="rounded border border-border px-1">Ctrl</kbd>+
                <kbd className="rounded border border-border px-1">Enter</kbd> to add it.
              </>
            ) : (
              "This note is empty."
            )}
          </p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="group relative rounded-xl border border-card-border bg-card/60 px-4 py-2"
            >
              <Markdown>{entry.md}</Markdown>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  aria-label="Delete entry"
                  className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-md text-muted transition-colors hover:bg-background hover:text-foreground group-hover:flex"
                >
                  ✕
                </button>
              )}
            </div>
          ))
        )}
        <div ref={feedEndRef} />
      </div>

      {/* Composer (only when editing is unlocked) */}
      {canEdit && (
        <div className="fixed bottom-4 left-1/2 z-30 w-[min(42rem,calc(100vw-2rem))] -translate-x-1/2">
          <div className="glass-edge rounded-2xl border border-foreground/10 bg-card/80 p-2 shadow-xl backdrop-blur-2xl backdrop-saturate-150">
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
      )}
    </div>
  );
}
