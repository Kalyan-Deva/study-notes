import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { serviceRoleConfigured, ADMIN_EMAIL } from "@/lib/supabase/config";
import { sendEmail } from "@/lib/email";

// Public: the submitter clicks the emailed link. Marks the submission confirmed
// so it appears in the admin queue, then redirects to a thank-you page.
export async function GET(req: Request) {
  const origin = req.headers.get("origin") ?? new URL(req.url).origin;
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "";
  const token = url.searchParams.get("token") ?? "";

  const fail = () => NextResponse.redirect(`${origin}/submit?confirmed=0`);
  if (!serviceRoleConfigured || !id || !token) return fail();

  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from("posts")
    .update({ email_confirmed: true, confirm_token: null })
    .eq("id", id)
    .eq("confirm_token", token)
    .eq("status", "pending")
    .select("title,submitter_email")
    .single();

  if (error || !data) return fail();

  if (ADMIN_EMAIL) {
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: "Lexicon — new post awaiting review",
      html: `<p><strong>${data.submitter_email ?? "Someone"}</strong> submitted
             “${data.title}”.</p>
             <p>Review it at <a href="${origin}/admin">${origin}/admin</a>.</p>`,
    });
  }

  return NextResponse.redirect(`${origin}/submit?confirmed=1`);
}
