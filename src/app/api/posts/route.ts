import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

// Create a post. Token gate temporarily removed for Posts — to re-lock, restore
// the getEditSession()/canEdit check (still used by the journal routes).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad request." }, { status: 400 });

  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from("posts")
    .insert({
      title: String(body.title ?? "").trim() || "Untitled",
      body: String(body.body ?? ""),
      category: String(body.category ?? "").trim() || "Posts",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
