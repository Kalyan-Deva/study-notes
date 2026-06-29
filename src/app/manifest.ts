import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

// Web app manifest — makes Lexicon installable as a PWA.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#191816",
    theme_color: "#191816",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Unlock Chrome's richer install UI (wide = desktop, narrow = mobile).
    screenshots: [
      {
        src: "/screenshot-wide",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Lexicon — a personal knowledge base",
      },
      {
        src: "/screenshot-narrow",
        sizes: "720x1280",
        type: "image/png",
        form_factor: "narrow",
        label: "Lexicon — a personal knowledge base",
      },
    ],
  };
}
