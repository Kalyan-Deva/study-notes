import Link from "next/link";
import { getCombinedNavTree } from "@/lib/nav";
import { getEditSession } from "@/lib/edit-auth";

export default async function Home() {
  const tree = await getCombinedNavTree();
  const total = tree.reduce((n, g) => n + g.notes.length, 0);
  const { canEdit } = await getEditSession();

  return (
    <div>
      <section className="border-b border-border pb-8">
        <h1 className="text-4xl font-bold tracking-tight">Lexicon</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">
          A personal knowledge base. Ask a question, get a clear explanation, and
          it lands here as a topic — browse them anytime from the sidebar.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <p className="text-sm text-muted">
            {total} {total === 1 ? "note" : "notes"} across {tree.length}{" "}
            {tree.length === 1 ? "category" : "categories"}.
          </p>
          {canEdit && (
            <Link href="/compose" className="text-sm font-medium text-accent hover:underline">
              + New post
            </Link>
          )}
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
