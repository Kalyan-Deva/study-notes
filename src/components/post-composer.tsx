"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { Markdown } from "@/components/markdown";
import type { Post } from "@/lib/supabase/types";

export function PostComposer({ post }: { post?: Post }) {
  const [title, setTitle] = useState(post?.title ?? "");
  // One continuous Markdown document — every Ctrl+Enter appends to it.
  const [body, setBody] = useState(post?.body ?? "");
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const docEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Keep the bottom of the growing document in view.
  useEffect(() => {
    docEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [body]);

  // Append the draft to the flowing document (blank line = new paragraph/block).
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

  // ── Markdown formatting helpers (operate on the textarea selection) ────────
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

    // Fold any leftover draft into the document so nothing is lost.
    const pending = draft.trim();
    const finalBody = pending ? (body ? `${body}\n\n${pending}` : pending) : body;

    const supabase = createSupabaseBrowser();
    const payload = { title: title.trim() || "Untitled", body: finalBody };
    const res = post
      ? await supabase.from("posts").update(payload).eq("id", post.id).select("id").single()
      : await supabase.from("posts").insert(payload).select("id").single();

    setSaving(false);
    if (res.error) {
      setErr(res.error.message);
      return;
    }

    setBody(finalBody);
    setDraft("");
    setDirty(false);

    // Posted — go look at it on its readable page.
    const id = post?.id ?? res.data?.id;
    if (id) {
      router.push(`/posts/${id}`);
      router.refresh();
    }
  }

  async function removePost() {
    if (!post) return;
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) {
      setErr(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  const toolBtn =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm text-muted transition-colors hover:bg-background hover:text-foreground";

  return (
    <div className="flex min-h-[calc(100vh-9rem)] flex-col">
      {/* Top bar: back, title, save, delete */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Link
          href="/"
          className="rounded-lg border border-border px-2.5 py-2 text-sm text-muted transition-colors hover:text-foreground"
          aria-label="Back to home"
        >
          ←
        </Link>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setDirty(true);
          }}
          placeholder="Post title"
          className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2 text-xl font-bold tracking-tight outline-none focus:border-accent"
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
      </div>

      {err && <p className="mb-3 text-sm text-accent">{err}</p>}

      {/* The flowing, readable document — pad the bottom so the composer never covers it */}
      <div className="flex-1 pb-52">
        {body ? (
          <Markdown>{body}</Markdown>
        ) : (
          <p className="text-sm text-muted">
            Write below and press{" "}
            <kbd className="rounded border border-border px-1">Ctrl</kbd>+
            <kbd className="rounded border border-border px-1">Enter</kbd> to add it to the
            page. Keep going — each chunk flows into one readable note.
          </p>
        )}
        <div ref={docEndRef} />
      </div>

      {/* Bigger composer fixed at the bottom center */}
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
          </div>

          <textarea
            ref={taRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            rows={4}
            placeholder="Write a paragraph, or a few points…  (Ctrl+Enter to add it to the page)"
            className="max-h-72 min-h-[6rem] w-full resize-none rounded-xl bg-transparent px-3 py-2 text-[15px] leading-relaxed outline-none"
          />

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
    </div>
  );
}
