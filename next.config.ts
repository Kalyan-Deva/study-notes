import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure the MDX notes in /content ship with the serverless function that
  // powers the public /api/feed route (it reads them via fs at runtime).
  outputFileTracingIncludes: {
    "/api/feed": ["./content/**/*"],
  },
};

export default nextConfig;
