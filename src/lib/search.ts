import "server-only";
import { getAllNotes, getNoteBySlug } from "./content";
import { createSupabaseServer } from "./supabase/server";
import { supabaseConfigured } from "./supabase/config";

// A lightweight searchable record. `body` is plain-text (markdown/JSX stripped)
// so search can match phrases inside the content, and we can show a snippet.
export type SearchDoc = {
  title: string;
  category: string;
  href: string;
  body: string;
};

function toText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ") // fenced code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links → label
    .replace(/<[^>]+>/g, " ") // html / jsx tags
    .replace(/[#>*_`~|]+/g, " ")
    .replace(/^\s*[-+]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Full-text index across topics (MDX), posts, and journal notes. All public.
export async function getSearchIndex(): Promise<SearchDoc[]> {
  const docs: SearchDoc[] = [];

  for (const meta of getAllNotes()) {
    const note = getNoteBySlug(meta.slug);
    docs.push({
      title: meta.title,
      category: meta.category,
      href: `/notes/${meta.slug}`,
      body: toText(`${meta.summary}\n${note?.body ?? ""}`),
    });
  }

  if (supabaseConfigured) {
    const supabase = await createSupabaseServer();

    const { data: posts } = await supabase
      .from("posts")
      .select("id,title,body,category")
      .eq("status", "published");
    for (const p of posts ?? []) {
      docs.push({
        title: p.title,
        category: p.category || "Posts",
        href: `/posts/${p.id}`,
        body: toText(p.body ?? ""),
      });
    }

    const { data: journal } = await supabase.from("journal_notes").select("id,title,entries");
    for (const j of journal ?? []) {
      const text = Array.isArray(j.entries)
        ? (j.entries as { md?: string }[]).map((e) => e?.md ?? "").join("\n")
        : "";
      docs.push({
        title: j.title,
        category: "Journal",
        href: `/journal/${j.id}`,
        body: toText(text),
      });
    }
  }

  return docs;
}
