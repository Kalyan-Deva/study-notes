import Link from "next/link";
import { getNavTree } from "@/lib/content";

export default function Home() {
  const tree = getNavTree();
  const total = tree.reduce((n, g) => n + g.notes.length, 0);

  return (
    <div>
      <section className="border-b border-border pb-8">
        <h1 className="text-4xl font-bold tracking-tight">Notes</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">
          A personal knowledge base. Ask a question, get a clear explanation, and
          it lands here as a topic — browse them anytime from the sidebar.
        </p>
        <p className="mt-4 text-sm text-muted">
          {total} {total === 1 ? "topic" : "topics"} across {tree.length}{" "}
          {tree.length === 1 ? "category" : "categories"}.
        </p>
      </section>

      {tree.length === 0 ? (
        <p className="mt-10 text-muted">No topics yet — ask your first question.</p>
      ) : (
        <div className="mt-10 space-y-10">
          {tree.map((group) => (
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
          ))}
        </div>
      )}
    </div>
  );
}
