"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

// Login only — public sign-up is closed while Lexicon is being built.
// (To re-enable later, restore the sign-up toggle + supabase.auth.signUp.)
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
    router.push("/me");
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
        Sign-ups are closed while Lexicon is being built.
      </p>
    </form>
  );
}
