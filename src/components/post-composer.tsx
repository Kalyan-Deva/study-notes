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
  const [showTools, setShowTools] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const docEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    docEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [body]);

  // Close the formatting menu when clicking outside it.
  useEffect(() => {
    if (!showTools) return;
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowTools(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showTools]);

  function commitDraft() {
    const chunk = draft.trim();
    if (!chunk) return;
    setBody((b) => (b ? `${b}\n\n${chunk}` : chunk));
    setDraft("");
    setDirty(true);
    requestAnimationFrame(() => taRef.current?.focus());
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    if (e.key === "Enter") {
      e.preventDefault();
      commitDraft();
      return;
    }
    // Formatting shortcuts.
    const k = e.key.toLowerCase();
    if (k === "b") {
      e.preventDefault();
      wrapSelection("**");
    } else if (k === "i") {
      e.preventDefault();
      wrapSelection("*");
    } else if (k === "u") {
      e.preventDefault();
      wrapSelection("<u>", "</u>");
    } else if (k === "e") {
      e.preventDefault();
      wrapSelection("`");
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

  // Insert text at the caret (used for embedding images between the lines).
  function insertAtCursor(text: string) {
    const ta = taRef.current;
    if (!ta) {
      setDraft((d) => d + text);
      setDirty(true);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    setDraft(draft.slice(0, start) + text + draft.slice(end));
    setDirty(true);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + text.length;
      ta.selectionStart = ta.selectionEnd = pos;
    });
  }

  async function uploadImage(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    setErr(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    setUploading(false);
    if (!res.ok) {
      setErr(json.error ?? "Upload failed.");
      return;
    }
    const alt = file.name.replace(/\.[^.]+$/, "");
    insertAtCursor(`\n![${alt}](${json.url})\n`);
  }

  // Paste an image straight from the clipboard.
  function onPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
    const file = item?.getAsFile();
    if (file) {
      e.preventDefault();
      uploadImage(file);
    }
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
      <div className={`flex-1 ${canEdit ? "pb-36" : "pb-8"}`}>
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
        <div className="fixed bottom-4 left-1/2 z-30 w-[min(38rem,calc(100vw-2rem))] -translate-x-1/2">
          <div className="glass-edge rounded-2xl border border-foreground/10 bg-card/80 p-2 shadow-xl backdrop-blur-2xl backdrop-saturate-150">
            {/* Formatting tucked behind a kebab menu, top-right */}
            <div ref={menuRef} className="relative mb-1 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTools((v) => !v)}
                className={toolBtn}
                aria-label="Formatting options"
                aria-expanded={showTools}
                title="Formatting"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <circle cx="12" cy="5" r="1.6" />
                  <circle cx="12" cy="12" r="1.6" />
                  <circle cx="12" cy="19" r="1.6" />
                </svg>
              </button>

              {showTools && (
                <div className="absolute bottom-full right-0 z-20 mb-2 flex w-60 flex-wrap gap-1 rounded-xl border border-foreground/10 bg-card p-1.5 shadow-xl">
                  <button type="button" className={toolBtn} title="Bold (Ctrl+B)" onClick={() => wrapSelection("**")}>
                    <strong>B</strong>
                  </button>
                  <button type="button" className={toolBtn} title="Italic (Ctrl+I)" onClick={() => wrapSelection("*")}>
                    <em>I</em>
                  </button>
                  <button type="button" className={toolBtn} title="Underline (Ctrl+U)" onClick={() => wrapSelection("<u>", "</u>")}>
                    <span className="underline">U</span>
                  </button>
                  <button type="button" className={toolBtn} title="Inline code (Ctrl+E)" onClick={() => wrapSelection("`")}>
                    <code className="text-xs">{"</>"}</code>
                  </button>
                  <button
                    type="button"
                    className={toolBtn}
                    title="Insert image (or paste one)"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? "…" : "Img"}
                  </button>
                  <button type="button" className={toolBtn} title="Bullet list" onClick={() => prefixLines(() => "- ")}>
                    • List
                  </button>
                  <button type="button" className={toolBtn} title="Numbered list" onClick={() => prefixLines((i) => `${i + 1}. `)}>
                    1. List
                  </button>
                  <button type="button" className={toolBtn} title="Heading" onClick={() => applyFormat("h2")}>
                    H2
                  </button>
                  <button type="button" className={toolBtn} title="Subheading" onClick={() => applyFormat("h3")}>
                    H3
                  </button>
                  <button type="button" className={toolBtn} title="Quote" onClick={() => applyFormat("quote")}>
                    ❝
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreview((v) => !v)}
                    className={`${toolBtn} ${preview ? "bg-background text-foreground" : ""}`}
                    title="Toggle live preview"
                    aria-pressed={preview}
                  >
                    {preview ? "Edit" : "Preview"}
                  </button>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadImage(f);
                e.target.value = "";
              }}
            />

            {preview ? (
              <div className="max-h-48 min-h-[2.5rem] overflow-y-auto rounded-xl border border-card-border px-3 py-2">
                <Markdown>{draft || "_Nothing to preview — start typing._"}</Markdown>
              </div>
            ) : (
              <textarea
                ref={taRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                onPaste={onPaste}
                rows={2}
                placeholder="Write…  (Ctrl+Enter to add)"
                className="max-h-40 min-h-[2.5rem] w-full resize-none rounded-xl bg-transparent px-3 py-1.5 text-sm leading-relaxed outline-none"
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
