# Lexicon

A personal knowledge base. Ask a question, get a clear explanation, and it lands here as a
browsable topic — with a public **Journal**, home-page **Posts**, full-text search, and
token-gated editing.

## Features

- **Topics** — long-form explainers authored as MDX in `content/`, grouped by category, with a
  table of contents, scroll-spy, and a knowledge graph (`/graph`).
- **Journal** (`/journal`) — open, chat-style notes: each `Ctrl+Enter` adds an entry to a feed.
- **Posts** (`/compose` → home page) — flowing, readable notes that publish onto the home page
  alongside topics; rich-text composer with a kebab formatting menu, keyboard shortcuts
  (`Ctrl+B/I/U/E`), live preview, inline image upload, reading time, and a table of contents.
- **Full-text search** (`⌘K`) — searches titles *and* body content across topics, posts, and
  journal, with snippets.
- **Token-gated editing** — content is public to read; editing requires a 24-hour token. Visitors
  request access at `/edit-access`; the admin approves on `/admin` and the token is emailed (Resend).
  (Posts editing is currently open; Journal is gated.)
- **Admin-only auth** — no public accounts; a single admin signs in at `/login` to manage requests.
- **SEO & sharing** — generated Open Graph images, Open Graph/Twitter metadata, `sitemap.xml`,
  `robots.txt`, and an RSS feed (`/feed.xml`).
- **Theming** — dark by default, light toggle; all colors are CSS variables in `globals.css`.

## Tech stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 ·
`next-mdx-remote` + `react-markdown` (rehype/remark) · Supabase (Postgres + Auth + Storage) ·
Resend (email) · `next/og`.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3002
```

The curated topics work with no setup. The Journal, Posts, search, editing, and email features
need Supabase (and optionally Resend) — see **[SETUP-SUPABASE.md](SETUP-SUPABASE.md)** for the SQL
to run and the environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # server-only; bypasses RLS for token-validated writes
ADMIN_EMAIL=you@example.com          # gates /admin
RESEND_API_KEY=re_...                # optional; without it, tokens are shown on /admin to send manually
EDIT_FROM_EMAIL=Lexicon <you@yourdomain>   # optional; defaults to Resend's test sender
NEXT_PUBLIC_SITE_URL=https://yourdomain    # canonical URL for sitemap/RSS/OG (defaults to localhost)
```

## Adding a topic

Drop a `.mdx` file in `content/<anything>/<slug>.mdx` with frontmatter — it renders at
`/notes/<slug>` and appears in the sidebar. See **[ADDING-TOPICS.md](ADDING-TOPICS.md)**.

## Scripts

```bash
npm run dev      # dev server (port 3002)
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

## Deploy

Deploys cleanly to Vercel. Set the environment variables above (especially `NEXT_PUBLIC_SITE_URL`)
so canonical URLs, the sitemap, RSS, and Open Graph images resolve to your real domain.
