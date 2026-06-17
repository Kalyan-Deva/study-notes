import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import { getAllSlugs, getNoteBySlug } from "@/lib/content";
import {
  ComplexityScale,
  Encapsulation,
  Handshake,
  LayerStack,
  SolveSteps,
} from "@/components/figures";
import { OnThisPage } from "@/components/on-this-page";

const mdxComponents = {
  LayerStack,
  Encapsulation,
  Handshake,
  SolveSteps,
  ComplexityScale,
};

// Pre-render known notes, but still render any new note added at runtime
// (a missing slug 404s via notFound() below). This keeps freshly-added MDX
// files working without depending on a cached generateStaticParams list.
export const dynamicParams = true;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const note = getNoteBySlug(slug);
  if (!note) return {};
  return { title: note.meta.title, description: note.meta.summary };
}

const prettyCodeOptions: PrettyCodeOptions = {
  theme: { light: "github-light", dark: "github-dark-dimmed" },
  keepBackground: false,
};

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = getNoteBySlug(slug);
  if (!note) notFound();

  const { content } = await compileMDX({
    source: note.body,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypePrettyCode, prettyCodeOptions],
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
        ],
      },
    },
  });

  return (
    <article>
      <header className="mb-5 border-b border-border pb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          {note.meta.category}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{note.meta.title}</h1>
        {note.meta.updated && (
          <p className="mt-2 text-xs text-muted">Updated {note.meta.updated}</p>
        )}
      </header>
      <OnThisPage />
      <div className="prose">{content}</div>
    </article>
  );
}
