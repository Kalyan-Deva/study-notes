import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure the MDX notes in /content ship with the serverless function that
  // powers the public /api/feed route (it reads them via fs at runtime).
  outputFileTracingIncludes: {
    "/api/feed": ["./content/**/*"],
  },
  // react-pdf ships native/font assets that shouldn't be bundled by Turbopack.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
