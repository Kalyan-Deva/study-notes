import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

// Create a post directly (published). Admin-only — the public writes via
// /api/posts/submit, which goes through the moderation queue.
export async function POST(req: Request) {
  const adminUser = await getAdminUser();
  if (!adminUser) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad request." }, { status: 400 });

  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from("posts")
    .insert({
      title: String(body.title ?? "").trim() || "Untitled",
      body: String(body.body ?? ""),
      category: String(body.category ?? "").trim() || "Posts",
      status: "published",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
