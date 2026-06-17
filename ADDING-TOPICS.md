# How topics work

Every topic is a single `.mdx` (or `.md`) file under `content/`. Folders are just for
your own organization — the sidebar groups by the `category` frontmatter field, not the
folder. Drop a file in, and it automatically:

- renders at `/notes/<filename>` (the slug is the filename without extension)
- appears in the right sidebar under its `category`
- shows on the home page

## Frontmatter

```yaml
---
title: "OSI Model"          # display title
category: "Networking"      # sidebar group
summary: "One-line blurb."  # shown on home + topic header
order: 1                    # sort order within the category (lower = first)
updated: "2026-06-17"       # optional date string
---
```

Then write normal Markdown / MDX below. Supported out of the box:

- **GFM**: tables, task lists, strikethrough (via `remark-gfm`)
- **Code blocks** with syntax highlighting + light/dark themes (via `rehype-pretty-code`)
- **Heading anchors**: every `##`/`###` is clickable (via `rehype-slug` +
  `rehype-autolink-headings`)

> Tip: don't repeat the title as an `# H1` — the page renders the title from frontmatter,
> so start your body at `##`.

## Category order

Categories are ordered by the smallest `order` among their topics, then alphabetically.
To force a category near the top, give one of its topics a low `order`.

## Reskinning

All colors live as CSS variables in `src/app/globals.css` (`:root` for light, `.dark`
for dark). Change those values to match an inspiration palette — nothing else needs to
touch.

## Run it

```bash
npm run dev    # http://localhost:3002
npm run build  # production build
```
