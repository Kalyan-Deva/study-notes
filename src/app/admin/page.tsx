import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { serviceRoleConfigured, ADMIN_EMAIL } from "@/lib/supabase/config";
import { AdminRequests, type PendingRequest } from "@/components/admin-requests";

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
  const { data } = await supabase
    .from("edit_tokens")
    .select("id,email,created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const requests = (data ?? []) as PendingRequest[];

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-5 flex items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit-token requests</h1>
          <p className="mt-1 text-sm text-muted">
            Approve to mint a 24-hour token and email it to the requester.
          </p>
        </div>
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          ← Home
        </Link>
      </header>

      <AdminRequests requests={requests} />
    </div>
  );
}
