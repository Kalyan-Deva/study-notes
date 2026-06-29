import { ImageResponse } from "next/og";
import { appIcon } from "@/lib/app-icon";

// 192x192 PWA icon (referenced by manifest.ts).
export function GET() {
  return new ImageResponse(appIcon(192), { width: 192, height: 192 });
}
