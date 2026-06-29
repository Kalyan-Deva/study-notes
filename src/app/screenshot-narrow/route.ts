import { ImageResponse } from "next/og";
import { appScreenshot } from "@/lib/app-screenshot";

// Narrow (mobile) PWA install screenshot.
export function GET() {
  return new ImageResponse(appScreenshot({ width: 720, height: 1280 }), {
    width: 720,
    height: 1280,
  });
}
