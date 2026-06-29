import { ImageResponse } from "next/og";
import { ogCard, OG_SIZE } from "@/lib/og-card";
import { createSupabaseServer } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Lexicon post";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  let title = "Lexicon";
  let eyebrow = "Post";

  if (supabaseConfigured) {
    const { id } = await params;
    const supabase = await createSupabaseServer();
    const { data } = await supabase.from("posts").select("title,category").eq("id", id).single();
    if (data) {
      title = data.title;
      eyebrow = data.category || "Post";
    }
  }

  return new ImageResponse(ogCard({ eyebrow, title }), { ...OG_SIZE });
}
