import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { serviceRoleConfigured } from "@/lib/supabase/config";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// Upload an image to the public `media` bucket, return its public URL.
export async function POST(req: Request) {
  if (!serviceRoleConfigured) {
    return NextResponse.json({ error: "Uploads aren't set up." }, { status: 503 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 5 MB." }, { status: 413 });
  }

  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `posts/${randomUUID()}.${ext || "png"}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const admin = createSupabaseAdmin();
  const { error } = await admin.storage
    .from("media")
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = admin.storage.from("media").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
