"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type PendingRequest = {
  id: string;
  email: string;
  created_at: string;
};

export function AdminRequests({ requests }: { requests: PendingRequest[] }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [issued, setIssued] = useState<
    Record<string, { token: string; emailed: boolean; emailError?: string | null }>
  >({});
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function act(id: string, action: "approve" | "reject") {
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
    if (action === "approve" && json.token) {
      setIssued((m) => ({
        ...m,
        [id]: { token: json.token, emailed: !!json.emailed, emailError: json.emailError },
      }));
    }
    router.refresh();
  }

  if (requests.length === 0) {
    return <p className="text-sm text-muted">No pending requests.</p>;
  }

  return (
    <div className="space-y-3">
      {err && <p className="text-sm text-accent">{err}</p>}
      {requests.map((r) => {
        const result = issued[r.id];
        return (
          <div
            key={r.id}
            className="rounded-xl border border-card-border bg-card p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{r.email}</p>
                <p className="text-xs text-muted">
                  Requested {new Date(r.created_at).toLocaleString()}
                </p>
              </div>
              {!result && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => act(r.id, "approve")}
                    disabled={busyId === r.id}
                    className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground transition-opacity disabled:opacity-60"
                  >
                    {busyId === r.id ? "…" : "Approve"}
                  </button>
                  <button
                    type="button"
                    onClick={() => act(r.id, "reject")}
                    disabled={busyId === r.id}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>

            {result && (
              <div className="mt-3 rounded-lg border border-card-border bg-background/60 p-3 text-sm">
                <p className="text-muted">
                  {result.emailed
                    ? `Token emailed to ${r.email}. You can also share it manually:`
                    : `Email wasn't sent — copy this token to ${r.email} yourself:`}
                </p>
                <code className="mt-1 block break-all rounded bg-card px-2 py-1 text-foreground">
                  {result.token}
                </code>
                {!result.emailed && result.emailError && (
                  <p className="mt-2 text-xs text-muted">Email error: {result.emailError}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
