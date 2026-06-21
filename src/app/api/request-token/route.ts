import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { serviceRoleConfigured, ADMIN_EMAIL } from "@/lib/supabase/config";
import { sendEmail } from "@/lib/email";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Public: anyone can request edit access by email. Creates a pending row and
// notifies the admin. Responses are intentionally uniform (no info leak).
export async function POST(req: Request) {
  if (!serviceRoleConfigured) {
    return NextResponse.json({ error: "Editing isn't set up yet." }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const admin = createSupabaseAdmin();

  // Dedupe: skip if there's already a recent pending request for this email.
  const { data: existing } = await admin
    .from("edit_tokens")
    .select("id,created_at")
    .eq("email", email)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const recent =
    existing && Date.now() - new Date(existing.created_at).getTime() < 60 * 60 * 1000;

  if (!recent) {
    await admin.from("edit_tokens").insert({ email, status: "pending" });

    if (ADMIN_EMAIL) {
      const origin = req.headers.get("origin") ?? new URL(req.url).origin;
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: "Lexicon — edit token requested",
        html: `<p><strong>${email}</strong> requested edit access.</p>
               <p>Approve or reject it here: <a href="${origin}/admin">${origin}/admin</a></p>`,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
