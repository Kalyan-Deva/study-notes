import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import { NoteEditor } from "@/components/note-editor";

export default async function NewNotePage() {
  if (!supabaseConfigured) redirect("/login");
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold tracking-tight">New note</h1>
      <NoteEditor />
    </div>
  );
}
