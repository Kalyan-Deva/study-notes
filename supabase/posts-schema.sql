-- Run this in your Supabase project: SQL Editor → New query → paste → Run.
-- Creates the PUBLIC "Posts" table — flowing, readable notes that show up on the
-- home page alongside the curated topics. Open like journal_notes: anyone can
-- read and write for now; the commented block at the end locks writes to signed-in
-- users later.

create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default 'Untitled',
  body        text not null default '',  -- one continuous Markdown document
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists posts_updated_idx on public.posts (updated_at desc);

alter table public.posts enable row level security;

drop policy if exists "posts_select_all" on public.posts;
create policy "posts_select_all" on public.posts for select using (true);

drop policy if exists "posts_insert_all" on public.posts;
create policy "posts_insert_all" on public.posts for insert with check (true);

drop policy if exists "posts_update_all" on public.posts;
create policy "posts_update_all" on public.posts for update using (true) with check (true);

drop policy if exists "posts_delete_all" on public.posts;
create policy "posts_delete_all" on public.posts for delete using (true);

-- Keep updated_at fresh on every update (reuses the shared helper).
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- ── LATER: gate editing behind auth (reads stay open) ──────────────────────
--   create policy "posts_insert_auth" on public.posts
--     for insert with check (auth.uid() is not null);
--   create policy "posts_update_auth" on public.posts
--     for update using (auth.uid() is not null) with check (auth.uid() is not null);
--   create policy "posts_delete_auth" on public.posts
--     for delete using (auth.uid() is not null);
