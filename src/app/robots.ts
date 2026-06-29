import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/edit-access", "/login", "/compose"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
