import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import { getEditSession } from "@/lib/edit-auth";
import type { JournalEntry } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Journal" };

// These notes are public to read; creating one needs a valid edit token.
export default async function JournalPage() {
  if (!supabaseConfigured) return <NotConfigured />;

  const { canEdit } = await getEditSession();
  const supabase = await createSupabaseServer();
  const { data: notes } = await supabase
    .from("journal_notes")
    .select("id,title,entries,updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div>
      <header className="mb-5 flex items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Journal</h1>
          <p className="mt-1 text-sm text-muted">
            Open, shared notes — anyone can read and add to these.
          </p>
        </div>
        {canEdit && (
          <Link
            href="/journal/new"
            className="shrink-0 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground"
          >
            + New note
          </Link>
        )}
      </header>

      {!notes || notes.length === 0 ? (
        <p className="text-muted">
          No notes yet.{" "}
          <Link href="/journal/new" className="text-accent">
            Start one →
          </Link>
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {notes.map((n) => {
            const count = Array.isArray(n.entries)
              ? (n.entries as JournalEntry[]).length
              : 0;
            return (
              <li key={n.id}>
                <Link
                  href={`/journal/${n.id}`}
                  className="block h-full rounded-xl border border-card-border bg-card p-4 transition-colors hover:border-accent"
                >
                  <p className="font-medium">{n.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {count} {count === 1 ? "entry" : "entries"} · updated{" "}
                    {new Date(n.updated_at).toLocaleString()}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function NotConfigured() {
  return (
    <div className="max-w-prose">
      <h1 className="text-2xl font-bold tracking-tight">Journal</h1>
      <p className="mt-3 text-muted">
        The Journal stores its notes in Supabase, which isn&apos;t set up yet. Add your
        Supabase keys to <code>.env.local</code> and run{" "}
        <code>supabase/journal-schema.sql</code> in the SQL editor, then restart the dev
        server. See <code>SETUP-SUPABASE.md</code>.
      </p>
    </div>
  );
}
