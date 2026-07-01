"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Markdown } from "@/components/markdown";

export type Submission = {
  id: string;
  title: string;
  category: string;
  submitter_email: string | null;
  body: string;
  created_at: string;
};

export function AdminPosts({ posts }: { posts: Submission[] }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function act(id: string, action: "approve-post" | "reject-post") {
    if (action === "reject-post" && !window.confirm("Reject and delete this submission?")) return;
    setBusyId(id);
    setErr(null);
    const res = await fetch(`/api/admin/${action}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const json = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) {
      setErr(json.error ?? "Something went wrong.");
      return;
    }
    router.refresh();
  }

  if (posts.length === 0) {
    return <p className="text-sm text-muted">No submissions awaiting review.</p>;
  }

  return (
    <div className="space-y-3">
      {err && <p className="text-sm text-accent">{err}</p>}
      {posts.map((p) => (
        <div key={p.id} className="rounded-xl border border-card-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium">{p.title}</p>
              <p className="text-xs text-muted">
                {p.submitter_email} · {p.category} ·{" "}
                {new Date(p.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => act(p.id, "approve-post")}
                disabled={busyId === p.id}
                className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground transition-opacity disabled:opacity-60"
              >
                {busyId === p.id ? "…" : "Approve"}
              </button>
              <button
                type="button"
                onClick={() => act(p.id, "reject-post")}
                disabled={busyId === p.id}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          </div>
          <details className="mt-3">
            <summary className="cursor-pointer text-sm text-accent">Preview</summary>
            <div className="mt-2 max-h-80 overflow-auto rounded-lg border border-card-border p-3">
              <Markdown>{p.body}</Markdown>
            </div>
          </details>
        </div>
      ))}
    </div>
  );
}
