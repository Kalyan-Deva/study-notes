"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

// Admin login only — there are no public accounts. Signing in lets the admin
// reach /admin to approve edit-token requests.
export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-4">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-accent py-2 text-sm font-semibold text-accent-foreground transition-opacity disabled:opacity-60"
      >
        {loading ? "…" : "Log in"}
      </button>
      {msg && <p className="text-center text-sm text-accent">{msg}</p>}
      <p className="text-center text-xs text-muted">
        Admin access only — there are no public accounts.
      </p>
    </form>
  );
}
