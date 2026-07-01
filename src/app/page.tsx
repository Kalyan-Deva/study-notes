import type { Metadata } from "next";
import Link from "next/link";
import { getCombinedNavTree } from "@/lib/nav";
import { JsonLd } from "@/components/json-ld";
import { websiteJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  // Descriptive, keyword-rich title/description for the home page (overrides the
  // bare "Lexicon" default from the layout) — better for search results.
  title: {
    absolute: "Lexicon — A personal knowledge base for computing & security",
  },
  description:
    "Clear, searchable notes and explainers on computing, networking, programming, and security. Ask a question and it becomes a browsable topic.",
};

export default async function Home() {
  const tree = await getCombinedNavTree();
  const total = tree.reduce((n, g) => n + g.notes.length, 0);

  return (
    <div>
      <JsonLd data={websiteJsonLd()} />
      <section className="border-b border-border pb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Lexicon — a personal knowledge base
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">
          Clear, searchable explanations on computing, networking, programming, and
          security — ask a question and it lands here as a topic you can browse anytime.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <p className="text-sm text-muted">
            {total} {total === 1 ? "note" : "notes"} across {tree.length}{" "}
            {tree.length === 1 ? "category" : "categories"}.
          </p>
          <Link href="/compose" className="text-sm font-medium text-accent hover:underline">
            + New post
          </Link>
        </div>
      </section>

      {tree.length === 0 ? (
        <p className="mt-10 text-muted">No notes yet — ask your first question.</p>
      ) : (
        <div className="mt-10 space-y-10">
          {tree.map((group) => (
            <section key={group.category}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
                {group.category}
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {group.notes.map((note) => (
                  <li key={note.href ?? note.slug}>
                    <Link
                      href={note.href ?? `/notes/${note.slug}`}
                      className="block h-full rounded-xl border border-card-border bg-card p-4 transition-colors hover:border-accent"
                    >
                      <p className="font-medium">{note.title}</p>
                      {note.summary && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted">
                          {note.summary}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
