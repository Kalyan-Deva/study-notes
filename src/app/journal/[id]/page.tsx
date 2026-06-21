import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import { getEditSession } from "@/lib/edit-auth";
import { JournalComposer } from "@/components/journal-composer";
import type { JournalNote } from "@/lib/supabase/types";

export default async function JournalNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!supabaseConfigured) {
    return (
      <p className="text-muted">
        Supabase isn&apos;t set up — see <code>SETUP-SUPABASE.md</code>.
      </p>
    );
  }

  const { id } = await params;
  const supabase = await createSupabaseServer();
  const { data: note } = await supabase
    .from("journal_notes")
    .select("*")
    .eq("id", id)
    .single();
  if (!note) notFound();

  const { canEdit } = await getEditSession();
  return <JournalComposer note={note as JournalNote} canEdit={canEdit} />;
}
