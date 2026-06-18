// True only when real Supabase env vars are present (not the placeholders).
// Lets the rest of the app degrade gracefully until the project is set up.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured =
  !!url &&
  !!key &&
  url.startsWith("https://") &&
  !url.includes("YOUR") &&
  !key.includes("YOUR");

export const SUPABASE_URL = url ?? "";
export const SUPABASE_ANON_KEY = key ?? "";
