import type { Metadata } from "next";
import Link from "next/link";
import { JournalComposer } from "@/components/journal-composer";
import { supabaseConfigured } from "@/lib/supabase/config";
import { getEditSession } from "@/lib/edit-auth";

export const metadata: Metadata = { title: "New journal note" };

export default async function NewJournalPage() {
  if (!supabaseConfigured) {
    return (
      <p className="text-muted">
        Supabase isn&apos;t set up — see <code>SETUP-SUPABASE.md</code>.
      </p>
    );
  }
  const { canEdit } = await getEditSession();
  if (!canEdit) {
    return (
      <p className="text-muted">
        Editing is locked.{" "}
        <Link href="/edit-access" className="text-accent hover:underline">
          Unlock with an edit token →
        </Link>
      </p>
    );
  }
  return <JournalComposer canEdit />;
}
