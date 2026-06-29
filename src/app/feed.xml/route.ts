import { createSupabaseServer } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

export const dynamic = "force-dynamic";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function blurb(body: string) {
  const text = body
    .replace(/[#>*_`~|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 240 ? `${text.slice(0, 237)}…` : text;
}

// RSS 2.0 feed of the latest posts.
export async function GET() {
  let posts: { id: string; title: string; body: string; updated_at: string }[] = [];
  if (supabaseConfigured) {
    const supabase = await createSupabaseServer();
    const { data } = await supabase
      .from("posts")
      .select("id,title,body,updated_at")
      .order("updated_at", { ascending: false })
      .limit(50);
    posts = data ?? [];
  }

  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE_URL}/posts/${p.id}</link>
      <guid isPermaLink="true">${SITE_URL}/posts/${p.id}</guid>
      <pubDate>${new Date(p.updated_at).toUTCString()}</pubDate>
      <description>${esc(blurb(p.body))}</description>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${esc(SITE_DESCRIPTION)}</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
}
