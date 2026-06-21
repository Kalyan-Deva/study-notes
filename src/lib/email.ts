import "server-only";
import { EDIT_FROM_EMAIL, RESEND_API_KEY, emailConfigured } from "./supabase/config";

type SendArgs = { to: string; subject: string; html: string };

// Minimal Resend wrapper (REST, no SDK). Returns ok:false when email isn't
// configured so callers can fall back (e.g. show the token to the admin).
export async function sendEmail({ to, subject, html }: SendArgs): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (!emailConfigured) return { ok: false, error: "Email is not configured." };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ from: EDIT_FROM_EMAIL, to, subject, html }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return { ok: false, error: `Resend ${res.status}: ${detail}` };
  }
  return { ok: true };
}
