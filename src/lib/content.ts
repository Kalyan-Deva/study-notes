import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type {
  GraphData,
  NavCategory,
  Note,
  NoteMeta,
} from "./types";

export type {
  GraphData,
  GraphEdge,
  GraphNode,
  NavCategory,
  Note,
  NoteMeta,
} from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");

function readAllFiles(): { file: string; raw: string }[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const entries = fs.readdirSync(CONTENT_DIR, { recursive: true }) as string[];
  return entries
    .filter((e) => e.endsWith(".mdx") || e.endsWith(".md"))
    .map((e) => ({
      file: e,
      raw: fs.readFileSync(path.join(CONTENT_DIR, e), "utf8"),
    }));
}

function parseMeta(file: string, raw: string): NoteMeta {
  const { data } = matter(raw);
  const slug = path.basename(file).replace(/\.mdx?$/, "");
  return {
    slug,
    title: data.title ?? slug,
    category: data.category ?? "Uncategorized",
    summary: data.summary ?? "",
    order: typeof data.order === "number" ? data.order : 999,
    updated: data.updated ? String(data.updated) : null,
  };
}

/** All notes, sorted by category then order then title. */
export function getAllNotes(): NoteMeta[] {
  return readAllFiles()
    .map(({ file, raw }) => parseMeta(file, raw))
    .sort(
      (a, b) =>
        a.order - b.order || a.title.localeCompare(b.title),
    );
}

/** Notes grouped into categories for the sidebar. */
export function getNavTree(): NavCategory[] {
  const notes = getAllNotes();
  const byCategory = new Map<string, NoteMeta[]>();
  for (const note of notes) {
    const list = byCategory.get(note.category) ?? [];
    list.push(note);
    byCategory.set(note.category, list);
  }
  // Order categories by their earliest `order` value, then alphabetically.
  return [...byCategory.entries()]
    .map(([category, list]) => ({
      category,
      notes: list.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
    }))
    .sort((a, b) => {
      const ao = Math.min(...a.notes.map((n) => n.order));
      const bo = Math.min(...b.notes.map((n) => n.order));
      return ao - bo || a.category.localeCompare(b.category);
    });
}

/** All notes flattened in sidebar reading order — for prev/next navigation. */
export function getOrderedNotes(): NoteMeta[] {
  return getNavTree().flatMap((g) => g.notes);
}

export function getNoteBySlug(slug: string): Note | null {
  const match = readAllFiles().find(
    ({ file }) => path.basename(file).replace(/\.mdx?$/, "") === slug,
  );
  if (!match) return null;
  const { content } = matter(match.raw);
  return { meta: parseMeta(match.file, match.raw), body: content };
}

export function getAllSlugs(): string[] {
  return getAllNotes().map((n) => n.slug);
}

/** Build a graph of notes (nodes) and the links between them (edges), by
 *  scanning each note body for /notes/<slug> references. */
export function getLinkGraph(): GraphData {
  const all = readAllFiles().map(({ file, raw }) => ({
    meta: parseMeta(file, raw),
    body: matter(raw).content,
  }));
  const slugs = new Set(all.map((a) => a.meta.slug));
  const nodes = all
    .map((a) => ({
      slug: a.meta.slug,
      title: a.meta.title,
      category: a.meta.category,
    }))
    .sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));

  const seen = new Set<string>();
  const edges: GraphData["edges"] = [];
  for (const a of all) {
    const targets = new Set(
      [...a.body.matchAll(/\/notes\/([a-z0-9-]+)/g)].map((m) => m[1]),
    );
    for (const t of targets) {
      if (t !== a.meta.slug && slugs.has(t)) {
        const key = `${a.meta.slug}->${t}`;
        if (!seen.has(key)) {
          seen.add(key);
          edges.push({ source: a.meta.slug, target: t });
        }
      }
    }
  }
  return { nodes, edges };
}

/** Notes related to `slug` — any note it links to, or that links to it. */
export function getRelated(slug: string): NoteMeta[] {
  const { edges } = getLinkGraph();
  const related = new Set<string>();
  for (const e of edges) {
    if (e.source === slug) related.add(e.target);
    if (e.target === slug) related.add(e.source);
  }
  const bySlug = new Map(getAllNotes().map((n) => [n.slug, n]));
  return [...related]
    .map((s) => bySlug.get(s))
    .filter((n): n is NoteMeta => Boolean(n))
    .sort((a, b) => a.title.localeCompare(b.title));
}
