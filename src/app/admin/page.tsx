import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { serviceRoleConfigured, ADMIN_EMAIL } from "@/lib/supabase/config";
import { AdminRequests, type PendingRequest } from "@/components/admin-requests";
import { AdminTokens, type ActiveToken } from "@/components/admin-tokens";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  if (!serviceRoleConfigured || !ADMIN_EMAIL) {
    return (
      <p className="text-muted">
        Token editing isn&apos;t set up — see <code>SETUP-SUPABASE.md</code>.
      </p>
    );
  }

  const admin = await getAdminUser();
  if (!admin) redirect("/login");

  const supabase = createSupabaseAdmin();

  const { data: pending } = await supabase
    .from("edit_tokens")
    .select("id,email,created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const { data: active } = await supabase
    .from("edit_tokens")
    .select("id,email,approved_at,expires_at")
    .eq("status", "approved")
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: true });

  const requests = (pending ?? []) as PendingRequest[];
  const tokens = (active ?? []) as ActiveToken[];

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6 flex items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
          <p className="mt-1 text-sm text-muted">Manage edit access.</p>
        </div>
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          ← Home
        </Link>
      </header>

      <section className="mb-10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Pending requests{requests.length > 0 && ` (${requests.length})`}
        </h2>
        <AdminRequests requests={requests} />
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Active tokens{tokens.length > 0 && ` (${tokens.length})`}
        </h2>
        <AdminTokens tokens={tokens} />
      </section>
    </div>
  );
}
