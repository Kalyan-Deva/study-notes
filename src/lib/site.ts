// Canonical site identity used for metadata, OG images, sitemap, and RSS.
// Set NEXT_PUBLIC_SITE_URL to your real domain in production (e.g. https://kalyan.dev).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002"
).replace(/\/$/, "");

export const SITE_NAME = "Lexicon";
export const SITE_DESCRIPTION =
  "A personal knowledge base — ask a question, get a clear explanation, saved as a topic.";
