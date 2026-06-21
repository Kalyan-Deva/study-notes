import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { supabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Admin login" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md py-6">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Admin login</h1>
      <p className="mb-6 text-sm text-muted">
        Sign in to manage Lexicon and approve edit-access requests.
      </p>
      {supabaseConfigured ? (
        <AuthForm />
      ) : (
        <div className="rounded-xl border border-card-border bg-card p-4 text-sm text-muted">
          Supabase isn&apos;t set up yet. Follow{" "}
          <code className="text-foreground">SETUP-SUPABASE.md</code> to connect a project, then
          restart the dev server.
        </div>
      )}
    </div>
  );
}
