import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure the MDX notes in /content ship with the serverless function that
  // powers the public /api/feed route (it reads them via fs at runtime).
  outputFileTracingIncludes: {
    "/api/feed": ["./content/**/*"],
  },
  // Keep the headless-Chromium deps out of the bundle so the /api/pdf route
  // works on Vercel (they're loaded at runtime, not bundled).
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
};

export default nextConfig;
