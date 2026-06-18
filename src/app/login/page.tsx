import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { supabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md py-6">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Log in to Lexicon</h1>
      <p className="mb-6 text-sm text-muted">
        Sign in to write and keep your own private notes alongside the library.
      </p>
      {supabaseConfigured ? (
        <AuthForm />
      ) : (
        <div className="rounded-xl border border-card-border bg-card p-4 text-sm text-muted">
          Accounts aren&apos;t set up yet. Follow{" "}
          <code className="text-foreground">SETUP-SUPABASE.md</code> to connect a free Supabase
          project, then restart the dev server.
        </div>
      )}
    </div>
  );
}
