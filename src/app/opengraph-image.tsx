import { ImageResponse } from "next/og";
import { ogCard, OG_SIZE } from "@/lib/og-card";
import { SITE_DESCRIPTION } from "@/lib/site";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Lexicon";

export default function Image() {
  return new ImageResponse(ogCard({ eyebrow: "Knowledge base", title: SITE_DESCRIPTION }), {
    ...OG_SIZE,
  });
}
