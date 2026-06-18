"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { supabaseConfigured } from "@/lib/supabase/config";

export function AuthButton() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!supabaseConfigured) return;
    const supabase = createSupabaseBrowser();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!supabaseConfigured) return null;

  async function signOut() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    setEmail(null);
    router.push("/");
    router.refresh();
  }

  if (!ready) {
    return <span className="hidden h-9 w-16 rounded-lg sm:block" aria-hidden="true" />;
  }

  if (!email) {
    return (
      <Link
        href="/login"
        className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:bg-card hover:text-foreground"
      >
        Log in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/me"
        className="rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-card"
      >
        My notes
      </Link>
      <button
        type="button"
        onClick={signOut}
        title={`Signed in as ${email} — log out`}
        className="text-xs text-muted transition-colors hover:text-foreground"
      >
        Log out
      </button>
    </div>
  );
}
