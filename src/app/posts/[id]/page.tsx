import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import { Markdown } from "@/components/markdown";
import type { Post } from "@/lib/supabase/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  if (!supabaseConfigured) return {};
  const { id } = await params;
  const supabase = await createSupabaseServer();
  const { data } = await supabase.from("posts").select("title").eq("id", id).single();
  return { title: data?.title ?? "Post" };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!supabaseConfigured) notFound();

  const { id } = await params;
  const supabase = await createSupabaseServer();
  const { data: post } = await supabase.from("posts").select("*").eq("id", id).single();
  if (!post) notFound();

  const p = post as Post;

  return (
    <article className="min-w-0">
      <header className="mb-5 border-b border-border pb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          {p.category || "Posts"}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{p.title}</h1>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted">
          <span>Updated {new Date(p.updated_at).toLocaleDateString()}</span>
          <Link href={`/compose/${p.id}`} className="text-accent hover:underline">
            Edit
          </Link>
        </div>
      </header>
      <Markdown>{p.body}</Markdown>
    </article>
  );
}
