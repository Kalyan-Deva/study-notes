import { ImageResponse } from "next/og";
import { appScreenshot } from "@/lib/app-screenshot";

// Wide (desktop) PWA install screenshot.
export function GET() {
  return new ImageResponse(appScreenshot({ width: 1280, height: 720 }), {
    width: 1280,
    height: 720,
  });
}
