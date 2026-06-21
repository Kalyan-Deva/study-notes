import { NextResponse } from "next/server";
import { getEditSession } from "@/lib/edit-auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

// Create a journal note. Requires a valid edit token.
export async function POST(req: Request) {
  const session = await getEditSession();
  if (!session.canEdit) {
    return NextResponse.json({ error: "Editing requires a valid token." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad request." }, { status: 400 });

  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from("journal_notes")
    .insert({
      title: String(body.title ?? "").trim() || "Untitled",
      entries: Array.isArray(body.entries) ? body.entries : [],
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
