import { ImageResponse } from "next/og";
import { ogCard, OG_SIZE } from "@/lib/og-card";
import { getNoteBySlug } from "@/lib/content";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Lexicon topic";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = getNoteBySlug(slug);
  return new ImageResponse(
    ogCard({
      eyebrow: note?.meta.category ?? "Topic",
      title: note?.meta.title ?? "Lexicon",
    }),
    { ...OG_SIZE },
  );
}
