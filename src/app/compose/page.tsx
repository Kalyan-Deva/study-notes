import type { Metadata } from "next";
import { PostComposer } from "@/components/post-composer";
import { supabaseConfigured } from "@/lib/supabase/config";
import { getNavTree } from "@/lib/content";

export const metadata: Metadata = { title: "New post" };

// Posts are open to edit for now (no token required); re-add a getEditSession
// gate here to lock it later.
export default async function ComposePage() {
  if (!supabaseConfigured) {
    return (
      <p className="text-muted">
        Supabase isn&apos;t set up — see <code>SETUP-SUPABASE.md</code>.
      </p>
    );
  }
  const categories = getNavTree().map((g) => g.category);
  return <PostComposer categories={categories} canEdit />;
}
