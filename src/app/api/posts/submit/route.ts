import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { serviceRoleConfigured } from "@/lib/supabase/config";
import { emailAllowed, EMAIL_RULE_MESSAGE } from "@/lib/email-domain";
import { generateToken } from "@/lib/edit-auth";
import { sendEmail } from "@/lib/email";

// Public: submit a post for moderation. Saved as 'pending' and only enters the
// admin queue after the submitter confirms via the emailed link.
export async function POST(req: Request) {
  if (!serviceRoleConfigured) {
    return NextResponse.json({ error: "Submissions aren't set up yet." }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const content = typeof body?.body === "string" ? body.body : "";
  const category = typeof body?.category === "string" ? body.category.trim() : "";

  if (!emailAllowed(email)) {
    return NextResponse.json({ error: EMAIL_RULE_MESSAGE }, { status: 400 });
  }
  if (!content.trim()) {
    return NextResponse.json({ error: "Write something first." }, { status: 400 });
  }

  const admin = createSupabaseAdmin();

  // Light rate limit: cap unconfirmed pending submissions per email per hour.
  const { count } = await admin
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("submitter_email", email)
    .eq("status", "pending")
    .eq("email_confirmed", false)
    .gt("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());
  if ((count ?? 0) >= 3) {
    return NextResponse.json(
      { error: "Too many pending submissions — confirm your earlier ones first." },
      { status: 429 },
    );
  }

  const token = generateToken();
  const { data, error } = await admin
    .from("posts")
    .insert({
      title: title || "Untitled",
      body: content,
      category: category || "Community",
      status: "pending",
      submitter_email: email,
      email_confirmed: false,
      confirm_token: token,
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Could not submit." }, { status: 500 });
  }

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;
  const mail = await sendEmail({
    to: email,
    subject: "Confirm your Lexicon submission",
    html: `<p>Thanks for submitting <strong>${title || "your post"}</strong> to Lexicon.</p>
           <p>Confirm your email to send it for review:</p>
           <p><a href="${origin}/api/posts/confirm?id=${data.id}&token=${token}">Confirm submission</a></p>
           <p>If you didn't submit this, ignore this email.</p>`,
  });

  // If the confirmation email couldn't be sent, don't leave an unconfirmable
  // row lying around, and tell the submitter the truth.
  if (!mail.ok) {
    console.error("Submission confirmation email failed:", mail.error);
    await admin.from("posts").delete().eq("id", data.id);
    return NextResponse.json(
      { error: "We couldn't send the confirmation email — please try again shortly." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
