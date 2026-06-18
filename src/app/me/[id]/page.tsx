import { notFound, redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import { NoteEditor } from "@/components/note-editor";
import type { UserNote } from "@/lib/supabase/types";

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!supabaseConfigured) redirect("/login");
  const { id } = await params;
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: note } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();
  if (!note) notFound();

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold tracking-tight">Edit note</h1>
      <NoteEditor note={note as UserNote} />
    </div>
  );
}
