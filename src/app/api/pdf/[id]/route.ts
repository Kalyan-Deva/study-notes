import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import { renderPostPdf } from "@/components/post-pdf";
import type { Post } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "post"
  );
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!supabaseConfigured) return new NextResponse("PDF not available", { status: 503 });

  const { id } = await params;
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .single();
  if (!data) return new NextResponse("Not found", { status: 404 });

  const p = data as Post;
  const words = p.body.trim() ? p.body.trim().split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / 200));
  const dateStr = new Date(p.updated_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  try {
    const pdf = await renderPostPdf(p, dateStr, minutes);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${slugify(p.title)}.pdf"`,
      },
    });
  } catch (e) {
    console.error("PDF generation failed:", e);
    return new NextResponse(
      `PDF generation failed: ${e instanceof Error ? e.message : "unknown error"}`,
      { status: 500 },
    );
  }
}
