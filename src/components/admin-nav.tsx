"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

// Admin-only header controls. Renders nothing for everyone else — there is no
// public login.
export function AdminNav({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();

  if (!isAdmin) return null;

  async function signOut() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/admin"
        className="rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-card"
      >
        Admin
      </Link>
      <button
        type="button"
        onClick={signOut}
        title="Log out"
        className="text-xs text-muted transition-colors hover:text-foreground"
      >
        Log out
      </button>
    </div>
  );
}
