"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type ActiveToken = {
  id: string;
  email: string;
  approved_at: string | null;
  expires_at: string | null;
};

export function AdminTokens({ tokens }: { tokens: ActiveToken[] }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function revoke(id: string) {
    if (!window.confirm("Revoke this token? The holder loses edit access immediately.")) return;
    setBusyId(id);
    setErr(null);
    const res = await fetch("/api/admin/revoke", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const json = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) {
      setErr(json.error ?? "Could not revoke.");
      return;
    }
    router.refresh();
  }

  if (tokens.length === 0) {
    return <p className="text-sm text-muted">No active tokens.</p>;
  }

  return (
    <div className="space-y-3">
      {err && <p className="text-sm text-accent">{err}</p>}
      {tokens.map((t) => (
        <div
          key={t.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-card-border bg-card p-4"
        >
          <div>
            <p className="font-medium">{t.email}</p>
            <p className="text-xs text-muted">
              {t.approved_at && `Issued ${new Date(t.approved_at).toLocaleString()}`}
              {t.expires_at && ` · expires ${new Date(t.expires_at).toLocaleString()}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => revoke(t.id)}
            disabled={busyId === t.id}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground disabled:opacity-60"
          >
            {busyId === t.id ? "…" : "Revoke"}
          </button>
        </div>
      ))}
    </div>
  );
}
