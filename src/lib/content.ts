import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { NavCategory, Note, NoteMeta } from "./types";

export type { NavCategory, Note, NoteMeta } from "./types";

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
