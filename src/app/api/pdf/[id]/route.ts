import { NextResponse } from "next/server";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { createSupabaseServer } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import { buildPdfHtml } from "@/lib/pdf-template";
import type { Post } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    h1: [...(defaultSchema.attributes?.h1 ?? []), "id"],
    h2: [...(defaultSchema.attributes?.h2 ?? []), "id"],
    h3: [...(defaultSchema.attributes?.h3 ?? []), "id"],
    h4: [...(defaultSchema.attributes?.h4 ?? []), "id"],
  },
};

// Markdown → sanitized HTML, without React (route handlers can't import
// react-dom/server).
async function mdToHtml(md: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeSanitize, schema)
    .use(rehypeStringify)
    .process(md || "");
  return String(file);
}

// Local dev launches the installed Chrome; on Vercel/serverless we use the
// bundled @sparticuz/chromium binary.
async function launchBrowser() {
  const puppeteer = (await import("puppeteer-core")).default;
  if (process.env.VERCEL) {
    const chromium = (await import("@sparticuz/chromium")).default;
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }
  return puppeteer.launch({ channel: "chrome", headless: true });
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "post"
  );
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!supabaseConfigured) return new NextResponse("PDF not available", { status: 503 });

  const { id } = await params;
  const supabase = await createSupabaseServer();
  const { data } = await supabase.from("posts").select("*").eq("id", id).single();
  if (!data) return new NextResponse("Not found", { status: 404 });

  const p = data as Post;
  const bodyHtml = await mdToHtml(p.body);
  const words = p.body.trim() ? p.body.trim().split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / 200));
  const dateStr = new Date(p.updated_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = buildPdfHtml({
    title: p.title,
    category: p.category || "Post",
    bodyHtml,
    dateStr,
    minutes,
  });

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "18mm", right: "18mm" },
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate: `<div style="width:100%;font-family:Arial,sans-serif;font-size:8px;color:#9a948c;padding:0 18mm;display:flex;justify-content:space-between;">
        <span>Lexicon</span>
        <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>`,
    });

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${slugify(p.title)}.pdf"`,
      },
    });
  } finally {
    await browser.close();
  }
}
