# Enabling accounts + personal notes (Supabase)

Lexicon's curated notes work with no setup. The **accounts + personal notes** feature needs a
free Supabase project. ~5 minutes:

## 1. Create a project
1. Go to [supabase.com](https://supabase.com) → sign in → **New project**.
2. Pick a name and a database password (any). Wait ~1 minute for it to provision.

## 2. Create the notes table
1. In the project: **SQL Editor → New query**.
2. Paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
   (This makes the `notes` table and the security rules so each user only sees their own.)
3. For the public **Journal** feature, run [`supabase/journal-schema.sql`](supabase/journal-schema.sql)
   too. (This makes the open `journal_notes` table — shared notes anyone can read and edit. The
   file has a commented block for later locking edits behind sign-in.)

## 3. Get your keys
1. **Project Settings → API**.
2. Copy the **Project URL** and the **anon / public key**.
3. Put them in `.env.local` at the project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
   (Both are public-by-design — the anon key is safe in the browser, protected by the row-level
   security rules.)

## 4. (Optional) Easier sign-up for personal use
By default Supabase asks new users to confirm their email. For a personal app you can skip that:
**Authentication → Sign In / Providers → Email →** turn **off "Confirm email"**. Then sign-up logs
you straight in.

## 5. Restart the dev server
Stop and re-run `npm run dev` so it picks up `.env.local`. You'll now see **Log in** in the header,
and after signing in, **My notes** where you can create and edit your own markdown notes.

That's it. Until these steps are done, the rest of Lexicon works exactly as before.
