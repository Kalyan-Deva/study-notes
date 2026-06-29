# Supabase setup (Journal, Posts, admin + token editing)

Lexicon's curated topics work with no setup. Supabase powers the public **Journal** and **Posts**,
the **admin login**, and **token-gated editing**. There are no public user accounts. ~5 minutes:

## 1. Create a project
1. Go to [supabase.com](https://supabase.com) → sign in → **New project**.
2. Pick a name and a database password (any). Wait ~1 minute for it to provision.

## 2. Run the SQL
In the project: **SQL Editor → New query**, then run each of these (paste → Run):

1. [`supabase/journal-schema.sql`](supabase/journal-schema.sql) — the public `journal_notes` table.
2. [`supabase/posts-schema.sql`](supabase/posts-schema.sql) — the public `posts` table (home-page notes).
3. [`supabase/edit-tokens-schema.sql`](supabase/edit-tokens-schema.sql) — the private `edit_tokens`
   table; **also locks Journal/Posts to read-only** so edits must go through a valid token.
4. [`supabase/storage.sql`](supabase/storage.sql) — a public `media` bucket for images embedded in
   posts (the composer's image upload). Uploads go through `/api/upload` via the service-role key.

(`supabase/schema.sql` is legacy — it created a per-user `notes` table for the old personal-notes
feature, which has been removed. You can skip it.)

## 3. Environment variables
**Project Settings → API**, then put these in `.env.local` at the project root:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key        # public-by-design, protected by RLS
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key     # SECRET — server-only, bypasses RLS for token writes
ADMIN_EMAIL=you@example.com                         # the account allowed into /admin

# Optional: automated emails (request notice + token delivery) via Resend.
# Without it, approving still works — the token is shown on /admin to send by hand.
RESEND_API_KEY=re_xxx
EDIT_FROM_EMAIL=Lexicon <onboarding@resend.dev>     # optional; Resend's test sender needs no domain
```

## 4. Create your admin account
There's no public sign-up, so create the admin user directly:
1. **Authentication → Users → Add user → Create new user**.
2. Use the same email as `ADMIN_EMAIL`, set a password, and enable **Auto Confirm User**
   (otherwise login fails with "Email not confirmed").

## 5. Restart the dev server
Stop and re-run `npm run dev` so it picks up `.env.local`.

## How editing works
- Everyone can **read** Journal/Posts. Editing is locked by default.
- A visitor requests access at **`/edit-access`** (enters their email).
- You get a notification, sign in at **`/login`**, and approve it on **`/admin`** → a 24-hour token
  is emailed to them (and shown on `/admin` to copy if email isn't configured).
- They paste the token at `/edit-access` to unlock editing for 24 hours.

To try it before wiring email, uncomment the token-insert block at the bottom of
`edit-tokens-schema.sql` (creates `TESTTOKEN123`), run it, and paste that at `/edit-access`.
