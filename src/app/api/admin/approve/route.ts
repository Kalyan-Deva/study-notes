import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { generateToken, hashToken, TOKEN_TTL_HOURS } from "@/lib/edit-auth";
import { sendEmail } from "@/lib/email";

// Admin-only: approve a pending request → mint a 24h token, email it to the
// requester. Returns the raw token so the admin can also deliver it manually
// (e.g. if email isn't configured).
export async function POST(req: Request) {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Missing request id." }, { status: 400 });

  const admin = createSupabaseAdmin();
  const token = generateToken();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000).toISOString();

  const { data, error } = await admin
    .from("edit_tokens")
    .update({
      token_hash: hashToken(token),
      status: "approved",
      approved_at: new Date().toISOString(),
      expires_at: expiresAt,
    })
    .eq("id", id)
    .eq("status", "pending")
    .select("email")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Request not found or already handled." },
      { status: 404 },
    );
  }

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;
  const mail = await sendEmail({
    to: data.email,
    subject: "Your Lexicon edit token",
    html: `<p>Your edit token (valid ${TOKEN_TTL_HOURS} hours):</p>
           <p style="font-size:18px"><code>${token}</code></p>
           <p>Paste it at <a href="${origin}/edit-access">${origin}/edit-access</a> to unlock editing.</p>`,
  });

  return NextResponse.json({
    ok: true,
    email: data.email,
    emailed: mail.ok,
    emailError: mail.ok ? null : mail.error,
    // Always returned so the trusted admin can copy/send manually if needed.
    token,
    expiresAt,
  });
}
