import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

// Token gate temporarily removed for Posts — restore the getEditSession()/canEdit
// check (as in the journal routes) to re-lock editing.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad request." }, { status: 400 });

  const admin = createSupabaseAdmin();
  const { error } = await admin
    .from("posts")
    .update({
      title: String(body.title ?? "").trim() || "Untitled",
      body: String(body.body ?? ""),
      category: String(body.category ?? "").trim() || "Posts",
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const admin = createSupabaseAdmin();
  const { error } = await admin.from("posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
