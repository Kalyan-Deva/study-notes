import { notFound, redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import { getAdminUser } from "@/lib/admin-auth";
import { PostComposer } from "@/components/post-composer";
import { getNavTree } from "@/lib/content";
import type { Post } from "@/lib/supabase/types";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!supabaseConfigured) {
    return (
      <p className="text-muted">
        Supabase isn&apos;t set up — see <code>SETUP-SUPABASE.md</code>.
      </p>
    );
  }

  const admin = await getAdminUser();
  if (!admin) redirect("/submit");

  const { id } = await params;
  const supabase = await createSupabaseServer();
  const { data: post } = await supabase.from("posts").select("*").eq("id", id).single();
  if (!post) notFound();

  const categories = getNavTree().map((g) => g.category);
  return <PostComposer post={post as Post} categories={categories} canEdit />;
}
