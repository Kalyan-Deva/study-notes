"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EditAccessForm({
  canEdit,
  expiresAt,
}: {
  canEdit: boolean;
  expiresAt: string | null;
}) {
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Request-a-token state.
  const [reqEmail, setReqEmail] = useState("");
  const [reqBusy, setReqBusy] = useState(false);
  const [reqSent, setReqSent] = useState(false);
  const [reqErr, setReqErr] = useState<string | null>(null);

  const router = useRouter();

  async function requestToken() {
    setReqBusy(true);
    setReqErr(null);
    const res = await fetch("/api/request-token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: reqEmail }),
    });
    const json = await res.json().catch(() => ({}));
    setReqBusy(false);
    if (!res.ok) {
      setReqErr(json.error ?? "Could not send the request.");
      return;
    }
    setReqSent(true);
    setReqEmail("");
  }

  async function unlock() {
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/edit-session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setErr(json.error ?? "Could not unlock editing.");
      return;
    }
    setToken("");
    router.refresh();
  }

  async function lock() {
    setBusy(true);
    await fetch("/api/edit-session", { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  if (canEdit) {
    return (
      <div className="rounded-xl border border-card-border bg-card p-4">
        <p className="text-sm">
          ✅ Editing is unlocked
          {expiresAt && (
            <> until <strong>{new Date(expiresAt).toLocaleString()}</strong></>
          )}
          .
        </p>
        <button
          type="button"
          onClick={lock}
          disabled={busy}
          className="mt-3 rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:text-foreground disabled:opacity-60"
        >
          Lock editing
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Enter your edit token</label>
        <div className="flex gap-2">
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && token.trim() && unlock()}
            placeholder="Paste the token from your email"
            className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={unlock}
            disabled={busy || !token.trim()}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity disabled:opacity-60"
          >
            {busy ? "…" : "Unlock"}
          </button>
        </div>
        {err && <p className="mt-2 text-sm text-accent">{err}</p>}
      </div>

      <div className="border-t border-border pt-4">
        <label className="mb-1 block text-sm font-medium">Don&apos;t have a token?</label>
        <p className="mb-2 text-sm text-muted">
          Request one — the admin will approve it and email you a 24-hour token.
        </p>
        {reqSent ? (
          <p className="rounded-lg border border-card-border bg-card/60 px-3 py-2 text-sm text-muted">
            ✅ Request sent. You&apos;ll get an email once it&apos;s approved.
          </p>
        ) : (
          <div className="flex gap-2">
            <input
              type="email"
              value={reqEmail}
              onChange={(e) => setReqEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && reqEmail.trim() && requestToken()}
              placeholder="you@example.com"
              className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={requestToken}
              disabled={reqBusy || !reqEmail.trim()}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-card disabled:opacity-60"
            >
              {reqBusy ? "…" : "Request"}
            </button>
          </div>
        )}
        {reqErr && <p className="mt-2 text-sm text-accent">{reqErr}</p>}
      </div>
    </div>
  );
}
