import type { Metadata } from "next";
import Link from "next/link";
import { PostComposer } from "@/components/post-composer";
import { supabaseConfigured } from "@/lib/supabase/config";
import { getEditSession } from "@/lib/edit-auth";
import { getNavTree } from "@/lib/content";

export const metadata: Metadata = { title: "New post" };

export default async function ComposePage() {
  if (!supabaseConfigured) {
    return (
      <p className="text-muted">
        Supabase isn&apos;t set up — see <code>SETUP-SUPABASE.md</code>.
      </p>
    );
  }
  const { canEdit } = await getEditSession();
  if (!canEdit) {
    return (
      <p className="text-muted">
        Editing is locked.{" "}
        <Link href="/edit-access" className="text-accent hover:underline">
          Unlock with an edit token →
        </Link>
      </p>
    );
  }
  const categories = getNavTree().map((g) => g.category);
  return <PostComposer categories={categories} canEdit />;
}
