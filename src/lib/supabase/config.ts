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

// Server-only service-role key — bypasses RLS for token-validated writes.
// NEVER expose this to the browser (no NEXT_PUBLIC_ prefix).
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const SUPABASE_SERVICE_ROLE_KEY = serviceKey ?? "";
export const serviceRoleConfigured =
  supabaseConfigured && !!serviceKey && !serviceKey.includes("YOUR");

// Admin (you): used to gate /admin and to receive token-request notifications.
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

// Email delivery (Resend). The from-address falls back to Resend's shared test
// sender, which works without verifying a domain.
export const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
export const EDIT_FROM_EMAIL = process.env.EDIT_FROM_EMAIL ?? "Lexicon <onboarding@resend.dev>";
export const emailConfigured = !!process.env.RESEND_API_KEY;
