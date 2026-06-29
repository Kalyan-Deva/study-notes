import "server-only";
import { cache } from "react";
import { getNavTree } from "./content";
import { createSupabaseServer } from "./supabase/server";
import { supabaseConfigured } from "./supabase/config";
import type { NavCategory, NoteMeta } from "./types";

// Posts sort after curated topics within a category (topics use small `order`s).
const POST_ORDER = 1000;

/** Turn a Markdown body into a short plain-text blurb for cards. */
export function postSummary(body: string): string {
  const text = body
    .replace(/[#>*_`~]+/g, " ")
    .replace(/^\s*[-+]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 160 ? `${text.slice(0, 157)}…` : text;
}

/**
 * The sidebar/search/home nav tree: curated MDX topics merged with public posts,
 * grouped by category. Posts carry an `href` to /posts/<id> so they can live in
 * the same tree as topics (which default to /notes/<slug>). Falls back to topics
 * only when Supabase isn't configured.
 */
export const getCombinedNavTree = cache(async (): Promise<NavCategory[]> => {
  const tree = getNavTree();
  if (!supabaseConfigured) return tree;

  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("posts")
    .select("id,title,body,category,updated_at")
    .order("updated_at", { ascending: false });

  const posts = data ?? [];
  if (posts.length === 0) return tree;

  const postMetas: NoteMeta[] = posts.map((p) => ({
    slug: p.id,
    title: p.title,
    category: p.category?.trim() || "Posts",
    summary: postSummary(p.body ?? ""),
    order: POST_ORDER,
    updated: p.updated_at,
    href: `/posts/${p.id}`,
  }));

  const byCategory = new Map<string, NoteMeta[]>(
    tree.map((g) => [g.category, [...g.notes]]),
  );
  for (const pm of postMetas) {
    const list = byCategory.get(pm.category) ?? [];
    list.push(pm);
    byCategory.set(pm.category, list);
  }

  return [...byCategory.entries()]
    .map(([category, notes]) => ({
      category,
      notes: notes.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
    }))
    .sort((a, b) => {
      const ao = Math.min(...a.notes.map((n) => n.order));
      const bo = Math.min(...b.notes.map((n) => n.order));
      return ao - bo || a.category.localeCompare(b.category);
    });
});
