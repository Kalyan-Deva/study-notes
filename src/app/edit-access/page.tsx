import type { Metadata } from "next";
import { getEditSession } from "@/lib/edit-auth";
import { serviceRoleConfigured } from "@/lib/supabase/config";
import { EditAccessForm } from "@/components/edit-access-form";

export const metadata: Metadata = { title: "Edit access" };

export default async function EditAccessPage() {
  const session = await getEditSession();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold tracking-tight">Edit access</h1>
      <p className="mt-2 mb-6 text-sm text-muted">
        Journal and Posts are public to read. Editing them needs a time-limited token.
      </p>

      {!serviceRoleConfigured ? (
        <p className="text-sm text-muted">
          Token editing isn&apos;t set up yet — add <code>SUPABASE_SERVICE_ROLE_KEY</code> to{" "}
          <code>.env.local</code> and run <code>supabase/edit-tokens-schema.sql</code>. See{" "}
          <code>SETUP-SUPABASE.md</code>.
        </p>
      ) : (
        <EditAccessForm canEdit={session.canEdit} expiresAt={session.expiresAt} />
      )}
    </div>
  );
}
