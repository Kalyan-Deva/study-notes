import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PostComposer } from "@/components/post-composer";
import { supabaseConfigured } from "@/lib/supabase/config";
import { getAdminUser } from "@/lib/admin-auth";
import { getNavTree } from "@/lib/content";

export const metadata: Metadata = { title: "New post" };

// Admin-only direct publishing. The public writes via /submit (moderated).
export default async function ComposePage() {
  if (!supabaseConfigured) {
    return (
      <p className="text-muted">
        Supabase isn&apos;t set up — see <code>SETUP-SUPABASE.md</code>.
      </p>
    );
  }
  const admin = await getAdminUser();
  if (!admin) redirect("/submit");

  const categories = getNavTree().map((g) => g.category);
  return <PostComposer categories={categories} canEdit />;
}
