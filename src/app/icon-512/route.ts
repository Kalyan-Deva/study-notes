import { ImageResponse } from "next/og";
import { appIcon } from "@/lib/app-icon";

// 512x512 PWA icon (referenced by manifest.ts, also used as the maskable icon).
export function GET() {
  return new ImageResponse(appIcon(512), { width: 512, height: 512 });
}
