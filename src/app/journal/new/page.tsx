import type { Metadata } from "next";
import { JournalComposer } from "@/components/journal-composer";
import { supabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "New journal note" };

export default function NewJournalPage() {
  if (!supabaseConfigured) {
    return (
      <p className="text-muted">
        Supabase isn&apos;t set up — see <code>SETUP-SUPABASE.md</code>.
      </p>
    );
  }
  return <JournalComposer />;
}
