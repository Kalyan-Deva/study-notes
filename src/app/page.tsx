import Link from "next/link";
import { getNavTree } from "@/lib/content";
import { createSupabaseServer } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import type { Post } from "@/lib/supabase/types";

// Turn a Markdown body into a short plain-text blurb for the home card.
function postSummary(body: string) {
  const text = body
    .replace(/[#>*_`~]+/g, " ")
    .replace(/^\s*[-+]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 160 ? `${text.slice(0, 157)}…` : text;
}

export default async function Home() {
  const tree = getNavTree();
  const total = tree.reduce((n, g) => n + g.notes.length, 0);

  // Public posts authored via the composer — shown alongside the curated topics.
  let posts: Pick<Post, "id" | "title" | "body" | "updated_at">[] = [];
  if (supabaseConfigured) {
    const supabase = await createSupabaseServer();
    const { data } = await supabase
      .from("posts")
      .select("id,title,body,updated_at")
      .order("updated_at", { ascending: false });
    posts = data ?? [];
  }

  return (
    <div>
      <section className="border-b border-border pb-8">
        <h1 className="text-4xl font-bold tracking-tight">Lexicon</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">
          A personal knowledge base. Ask a question, get a clear explanation, and
          it lands here as a topic — browse them anytime from the sidebar.
        </p>
        <p className="mt-4 text-sm text-muted">
          {total} {total === 1 ? "topic" : "topics"} across {tree.length}{" "}
          {tree.length === 1 ? "category" : "categories"}.
        </p>
      </section>

      <div className="mt-10 space-y-10">
        {posts.length > 0 && (
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
                Posts
              </h2>
              <Link href="/compose" className="text-xs font-medium text-accent hover:underline">
                + New post
              </Link>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {posts.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/posts/${p.id}`}
                    className="block h-full rounded-xl border border-card-border bg-card p-4 transition-colors hover:border-accent"
                  >
                    <p className="font-medium">{p.title}</p>
                    {p.body.trim() && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted">
                        {postSummary(p.body)}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tree.length === 0 && posts.length === 0 ? (
          <p className="text-muted">No topics yet — ask your first question.</p>
        ) : (
          tree.map((group) => (
            <section key={group.category}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
                {group.category}
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {group.notes.map((note) => (
                  <li key={note.slug}>
                    <Link
                      href={`/notes/${note.slug}`}
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
          ))
        )}
      </div>
    </div>
  );
}
