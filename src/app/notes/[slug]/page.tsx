import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import { getAllSlugs, getNoteBySlug, getOrderedNotes, getRelated } from "@/lib/content";
import {
  ComplexityScale,
  DataFlow,
  DnsResolution,
  Encapsulation,
  Handshake,
  HandshakeDiagram,
  Hint,
  LayerStack,
  SolveSteps,
  TcpIpStack,
  TcpVsUdp,
} from "@/components/figures";
import { OnThisPage } from "@/components/on-this-page";
import { ScrollSpyToc } from "@/components/scroll-spy-toc";
import { Highlighter } from "@/components/highlighter";
import { PrintButton } from "@/components/print-button";

const mdxComponents = {
  LayerStack,
  Encapsulation,
  Handshake,
  SolveSteps,
  ComplexityScale,
  TcpVsUdp,
  TcpIpStack,
  Hint,
  DnsResolution,
  DataFlow,
  HandshakeDiagram,
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
  const { title, summary } = note.meta;
  return {
    title,
    description: summary,
    openGraph: { type: "article", title, description: summary },
    twitter: { card: "summary_large_image", title, description: summary },
  };
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

  const ordered = getOrderedNotes();
  const idx = ordered.findIndex((n) => n.slug === slug);
  const prev = idx > 0 ? ordered[idx - 1] : null;
  const next = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null;
  const related = getRelated(slug);

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
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_12rem] xl:gap-10">
      <article className="min-w-0">
        <header className="mb-5 border-b border-border pb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            {note.meta.category}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{note.meta.title}</h1>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted">
            {note.meta.updated && <span>Updated {note.meta.updated}</span>}
            <PrintButton />
          </div>
        </header>
        <OnThisPage />
        <div className="prose">{content}</div>

        {related.length > 0 && (
          <div className="mt-10" data-print-hide>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Related notes
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/notes/${r.slug}`}
                    className="inline-block rounded-full border border-card-border bg-card px-3 py-1 text-sm transition-colors hover:border-accent"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(prev || next) && (
          <nav className="mt-12 flex items-stretch gap-4 border-t border-border pt-6">
            {prev ? (
              <Link
                href={`/notes/${prev.slug}`}
                className="flex-1 rounded-xl border border-card-border bg-card p-4 transition-colors hover:border-accent"
              >
                <span className="text-xs text-muted">← Previous</span>
                <span className="mt-1 block font-medium">{prev.title}</span>
              </Link>
            ) : (
              <span className="flex-1" />
            )}
            {next ? (
              <Link
                href={`/notes/${next.slug}`}
                className="flex-1 rounded-xl border border-card-border bg-card p-4 text-right transition-colors hover:border-accent"
              >
                <span className="text-xs text-muted">Next →</span>
                <span className="mt-1 block font-medium">{next.title}</span>
              </Link>
            ) : (
              <span className="flex-1" />
            )}
          </nav>
        )}
      </article>

      <aside className="hidden xl:block">
        <ScrollSpyToc />
      </aside>

      <Highlighter />
    </div>
  );
}
