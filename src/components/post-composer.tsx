"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Markdown } from "@/components/markdown";
import type { Post } from "@/lib/supabase/types";

export function PostComposer({
  post,
  categories = [],
  canEdit,
}: {
  post?: Post;
  categories?: string[];
  canEdit: boolean;
}) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [category, setCategory] = useState(post?.category ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [draft, setDraft] = useState("");
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const docEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    docEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [body]);

  function commitDraft() {
    const chunk = draft.trim();
    if (!chunk) return;
    setBody((b) => (b ? `${b}\n\n${chunk}` : chunk));
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

  function wrapSelection(before: string, after = before) {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = draft.slice(start, end) || "text";
    const next = draft.slice(0, start) + before + sel + after + draft.slice(end);
    setDraft(next);
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
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = lineStart;
      ta.selectionEnd = lineStart + prefixed.length;
    });
  }

  function applyFormat(value: string) {
    if (value === "h2") prefixLines(() => "## ");
    else if (value === "h3") prefixLines(() => "### ");
    else if (value === "quote") prefixLines(() => "> ");
  }

  async function save() {
    setSaving(true);
    setErr(null);
    const pending = draft.trim();
    const finalBody = pending ? (body ? `${body}\n\n${pending}` : pending) : body;

    const url = post ? `/api/posts/${post.id}` : "/api/posts";
    const res = await fetch(url, {
      method: post ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: title.trim() || "Untitled",
        body: finalBody,
        category: category.trim() || "Posts",
      }),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setErr(json.error ?? "Could not post.");
      return;
    }

    setBody(finalBody);
    setDraft("");
    setDirty(false);
    const id = post?.id ?? json.id;
    if (id) {
      router.push(`/posts/${id}`);
      router.refresh();
    }
  }

  async function removePost() {
    if (!post) return;
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setErr(json.error ?? "Could not delete.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  const toolBtn =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm text-muted transition-colors hover:bg-background hover:text-foreground";

  return (
    <div className="flex min-h-[calc(100vh-9rem)] flex-col">
      {/* Top bar */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Link
          href="/"
          className="rounded-lg border border-border px-2.5 py-2 text-sm text-muted transition-colors hover:text-foreground"
          aria-label="Back to home"
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
              placeholder="Post title"
              className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2 text-xl font-bold tracking-tight outline-none focus:border-accent"
            />
            <input
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setDirty(true);
              }}
              list="post-categories"
              placeholder="Category"
              className="w-32 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <datalist id="post-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
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
              {saving ? "Posting…" : "Post"}
            </button>
            {post && (
              <button
                type="button"
                onClick={removePost}
                className="rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
              >
                Delete
              </button>
            )}
          </>
        ) : (
          <h1 className="min-w-0 flex-1 truncate text-xl font-bold tracking-tight">
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

      {/* Flowing document */}
      <div className={`flex-1 ${canEdit ? "pb-52" : "pb-8"}`}>
        {body ? (
          <Markdown>{body}</Markdown>
        ) : (
          <p className="text-sm text-muted">
            {canEdit
              ? "Write below and press Ctrl+Enter to add it to the page. Each chunk flows into one readable note."
              : "This post is empty."}
          </p>
        )}
        <div ref={docEndRef} />
      </div>

      {/* Composer (only when editing is unlocked) */}
      {canEdit && (
        <div className="fixed bottom-4 left-1/2 z-30 w-[min(46rem,calc(100vw-2rem))] -translate-x-1/2">
          <div className="glass-edge rounded-2xl border border-foreground/10 bg-card/80 p-2.5 shadow-xl backdrop-blur-2xl backdrop-saturate-150">
            <div className="mb-2 flex flex-wrap items-center gap-1 px-1">
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
                <option value="h2">Heading</option>
                <option value="h3">Subheading</option>
                <option value="quote">Quote</option>
              </select>
              <button
                type="button"
                onClick={() => setPreview((v) => !v)}
                className={`${toolBtn} ml-auto ${preview ? "bg-background text-foreground" : ""}`}
                title="Toggle live preview"
                aria-pressed={preview}
              >
                {preview ? "Edit" : "Preview"}
              </button>
            </div>

            {preview ? (
              <div className="max-h-72 min-h-[6rem] overflow-y-auto rounded-xl border border-card-border px-3 py-2">
                <Markdown>{draft || "_Nothing to preview — start typing._"}</Markdown>
              </div>
            ) : (
              <textarea
                ref={taRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                rows={4}
                placeholder="Write a paragraph, or a few points…  (Ctrl+Enter to add it to the page)"
                className="max-h-72 min-h-[6rem] w-full resize-none rounded-xl bg-transparent px-3 py-2 text-[15px] leading-relaxed outline-none"
              />
            )}

            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-[11px] text-muted">
                <kbd className="rounded border border-border px-1">Ctrl</kbd>+
                <kbd className="rounded border border-border px-1">Enter</kbd> to add ·{" "}
                <strong>Post</strong> to publish on the home page
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
