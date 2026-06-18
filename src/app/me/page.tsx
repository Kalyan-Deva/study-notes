import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "My notes" };

export default async function MyNotesPage() {
  if (!supabaseConfigured) redirect("/login");
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: notes } = await supabase
    .from("notes")
    .select("id,title,updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div>
      <header className="mb-5 flex items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My notes</h1>
          <p className="mt-1 text-sm text-muted">Your private notes — only you can see these.</p>
        </div>
        <Link
          href="/me/new"
          className="shrink-0 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground"
        >
          + New note
        </Link>
      </header>

      {!notes || notes.length === 0 ? (
        <p className="text-muted">
          No notes yet.{" "}
          <Link href="/me/new" className="text-accent">
            Create your first one →
          </Link>
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {notes.map((n) => (
            <li key={n.id}>
              <Link
                href={`/me/${n.id}`}
                className="block h-full rounded-xl border border-card-border bg-card p-4 transition-colors hover:border-accent"
              >
                <p className="font-medium">{n.title}</p>
                <p className="mt-1 text-xs text-muted">
                  Updated {new Date(n.updated_at).toLocaleString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
