import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import { Markdown } from "@/components/markdown";
import { OnThisPage } from "@/components/on-this-page";
import { ScrollSpyToc } from "@/components/scroll-spy-toc";
import { JsonLd } from "@/components/json-ld";
import { articleJsonLd } from "@/lib/jsonld";
import { postSummary } from "@/lib/nav";
import { SITE_URL } from "@/lib/site";
import type { Post } from "@/lib/supabase/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  if (!supabaseConfigured) return {};
  const { id } = await params;
  const supabase = await createSupabaseServer();
  const { data } = await supabase.from("posts").select("title,body").eq("id", id).single();
  if (!data) return { title: "Post" };

  const description = data.body
    .replace(/[#>*_`~|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  return {
    title: data.title,
    description,
    openGraph: { type: "article", title: data.title, description },
    twitter: { card: "summary_large_image", title: data.title, description },
  };
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
  const words = p.body.trim() ? p.body.trim().split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / 200));

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_12rem] xl:gap-10">
      <JsonLd
        data={articleJsonLd({
          title: p.title,
          description: postSummary(p.body),
          url: `${SITE_URL}/posts/${p.id}`,
          image: `${SITE_URL}/posts/${p.id}/opengraph-image`,
          datePublished: p.created_at,
          dateModified: p.updated_at,
          crumbs: [
            { name: "Home", url: SITE_URL },
            { name: p.title, url: `${SITE_URL}/posts/${p.id}` },
          ],
        })}
      />
      <article className="min-w-0">
        <header className="mb-5 border-b border-border pb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            {p.category || "Posts"}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{p.title}</h1>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted">
            <span>Updated {new Date(p.updated_at).toLocaleDateString()}</span>
            <span aria-hidden="true">·</span>
            <span>{minutes} min read</span>
            <a
              href={`/api/pdf/${p.id}`}
              className="inline-flex items-center gap-1 text-accent hover:underline"
              title="Download a formatted PDF"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3v12" />
                <path d="m7 12 5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
              Download PDF
            </a>
            <Link href={`/compose/${p.id}`} className="text-accent hover:underline">
              Edit
            </Link>
          </div>
        </header>
        <OnThisPage />
        <Markdown>{p.body}</Markdown>
      </article>

      <aside className="hidden xl:block">
        <ScrollSpyToc />
      </aside>
    </div>
  );
}
