import { NextResponse } from "next/server";
import { getAllNotes } from "@/lib/content";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

// Public, read-only feed of everything published on Lexicon — the structured
// MDX notes plus the Supabase-backed journal posts. Consumed at build time by
// the portfolio site so they surface in its "Blog & Essays" section.
//
// force-dynamic so journal posts are always current; notes are read from the
// bundled /content dir (see outputFileTracingIncludes in next.config.ts).
export const dynamic = "force-dynamic";

const SITE = "https://lexxicon.vercel.app";

export type LexiconFeedItem = {
  type: "note" | "post";
  title: string;
  excerpt: string;
  category: string;
  url: string;
  date: string | null;
};

function toExcerpt(input: string, len = 200): string {
  return (input || "")
    .replace(/```[\s\S]*?```/g, " ") // code fences
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links → text
    .replace(/[#>*_`~|]/g, " ") // md punctuation
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, len);
}

export async function GET() {
  // 1. Structured notes (MDX files in /content)
  let notes: LexiconFeedItem[] = [];
  try {
    notes = getAllNotes().map((n) => ({
      type: "note",
      title: n.title,
      excerpt: n.summary || "",
      category: n.category || "Notes",
      url: `${SITE}/notes/${n.slug}`,
      date: n.updated ?? null,
    }));
  } catch {
    /* notes unavailable — still return posts */
  }

  // 2. Journal posts (Supabase `posts` table)
  let posts: LexiconFeedItem[] = [];
  try {
    const admin = createSupabaseAdmin();
    const { data } = await admin
      .from("posts")
      .select("id,title,body,category,created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    posts = (data ?? []).map((p) => ({
      type: "post",
      title: p.title || "Untitled",
      excerpt: toExcerpt(p.body),
      category: p.category || "Posts",
      url: `${SITE}/posts/${p.id}`,
      date: p.created_at ?? null,
    }));
  } catch {
    /* supabase unavailable — still return notes */
  }

  return NextResponse.json(
    { items: [...notes, ...posts] },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
