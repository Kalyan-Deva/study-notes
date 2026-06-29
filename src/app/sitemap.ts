import type { MetadataRoute } from "next";
import { getAllNotes } from "@/lib/content";
import { createSupabaseServer } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/journal`, changeFrequency: "weekly", priority: 0.5 },
  ];

  for (const n of getAllNotes()) {
    entries.push({
      url: `${SITE_URL}/notes/${n.slug}`,
      lastModified: n.updated ?? undefined,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  if (supabaseConfigured) {
    const supabase = await createSupabaseServer();
    const { data } = await supabase
      .from("posts")
      .select("id,updated_at")
      .order("updated_at", { ascending: false });
    for (const p of data ?? []) {
      entries.push({
        url: `${SITE_URL}/posts/${p.id}`,
        lastModified: p.updated_at,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
