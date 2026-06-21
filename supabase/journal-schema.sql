-- Run this in your Supabase project: SQL Editor → New query → paste → Run.
-- Creates the PUBLIC "Journal" notes table. Unlike the per-user `notes` table,
-- these are open: anyone can read and write them for now. Later we tighten the
-- write policies to require a signed-in user (see the commented block at the end).

create table if not exists public.journal_notes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default 'Untitled',
  entries     jsonb not null default '[]'::jsonb,  -- array of { id, md } chat-style entries
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists journal_notes_updated_idx on public.journal_notes (updated_at desc);

alter table public.journal_notes enable row level security;

-- OPEN policies: anyone (anonymous or signed-in) can read and write.
drop policy if exists "journal_select_all" on public.journal_notes;
create policy "journal_select_all" on public.journal_notes
  for select using (true);

drop policy if exists "journal_insert_all" on public.journal_notes;
create policy "journal_insert_all" on public.journal_notes
  for insert with check (true);

drop policy if exists "journal_update_all" on public.journal_notes;
create policy "journal_update_all" on public.journal_notes
  for update using (true) with check (true);

drop policy if exists "journal_delete_all" on public.journal_notes;
create policy "journal_delete_all" on public.journal_notes
  for delete using (true);

-- Keep updated_at fresh on every update. (Reuses the same helper as schema.sql;
-- safe to run even if that file already created it.)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists journal_set_updated_at on public.journal_notes;
create trigger journal_set_updated_at
  before update on public.journal_notes
  for each row execute function public.set_updated_at();

-- ── LATER: gate editing behind auth ────────────────────────────────────────
-- When you're ready to require sign-in to create/edit/delete (reads stay open),
-- replace the insert/update/delete policies above with these:
--
--   create policy "journal_insert_auth" on public.journal_notes
--     for insert with check (auth.uid() is not null);
--   create policy "journal_update_auth" on public.journal_notes
--     for update using (auth.uid() is not null) with check (auth.uid() is not null);
--   create policy "journal_delete_auth" on public.journal_notes
--     for delete using (auth.uid() is not null);
