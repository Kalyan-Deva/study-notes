"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { Markdown } from "@/components/markdown";
import type { UserNote } from "@/lib/supabase/types";

export function NoteEditor({ note }: { note?: UserNote }) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [body, setBody] = useState(note?.body ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function save() {
    setSaving(true);
    setErr(null);
    const supabase = createSupabaseBrowser();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setErr("You're not signed in.");
      setSaving(false);
      return;
    }
    const payload = { title: title.trim() || "Untitled", body };
    const res = note
      ? await supabase.from("notes").update(payload).eq("id", note.id)
      : await supabase.from("notes").insert({ ...payload, user_id: user.id });
    setSaving(false);
    if (res.error) {
      setErr(res.error.message);
      return;
    }
    router.push("/me");
    router.refresh();
  }

  async function remove() {
    if (!note) return;
    if (!window.confirm("Delete this note? This can't be undone.")) return;
    const supabase = createSupabaseBrowser();
    await supabase.from("notes").delete().eq("id", note.id);
    router.push("/me");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2 text-lg font-semibold outline-none focus:border-accent"
        />
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
            onClick={remove}
            className="rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
          >
            Delete
          </button>
        )}
      </div>
      {err && <p className="mb-3 text-sm text-accent">{err}</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write in Markdown… (# headings, **bold**, lists, `code`)"
          className="min-h-[55vh] w-full resize-y rounded-lg border border-border bg-card p-3 font-mono text-sm leading-relaxed outline-none focus:border-accent"
        />
        <div className="min-h-[55vh] overflow-auto rounded-lg border border-card-border p-4">
          <Markdown>{body}</Markdown>
        </div>
      </div>
    </div>
  );
}
