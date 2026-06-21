-- Run this in your Supabase project: SQL Editor → New query → paste → Run.
-- Sets up token-gated editing for the public Journal/Posts:
--   * a private edit_tokens table (server-only)
--   * locks WRITES on journal_notes / posts (reads stay public) — writes now go
--     through Next server routes using the service-role key, which bypasses RLS.

create table if not exists public.edit_tokens (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  token_hash  text,                                   -- sha256 hex of the token; set on approval
  status      text not null default 'pending',        -- pending | approved | rejected
  created_at  timestamptz not null default now(),
  approved_at timestamptz,
  expires_at  timestamptz
);

create index if not exists edit_tokens_hash_idx on public.edit_tokens (token_hash);
create index if not exists edit_tokens_status_idx on public.edit_tokens (status, created_at desc);

alter table public.edit_tokens enable row level security;
-- Intentionally NO policies: anon/authenticated clients get zero access.
-- Only the server (service-role key) reads or writes this table.

-- ── Lock writes on the public content tables ───────────────────────────────
-- Reads stay open (select policies remain); inserts/updates/deletes are removed,
-- so the browser can no longer write directly. Server routes use the service
-- role (bypasses RLS) after validating an edit token.
drop policy if exists "journal_insert_all" on public.journal_notes;
drop policy if exists "journal_update_all" on public.journal_notes;
drop policy if exists "journal_delete_all" on public.journal_notes;

drop policy if exists "posts_insert_all" on public.posts;
drop policy if exists "posts_update_all" on public.posts;
drop policy if exists "posts_delete_all" on public.posts;

-- ── Phase-1 testing helper (no email yet) ──────────────────────────────────
-- Create a known token "TESTTOKEN123" valid for 24h so you can try editing
-- before the request/approve/email flow exists. Uncomment and run:
--
-- insert into public.edit_tokens (email, token_hash, status, approved_at, expires_at)
-- values ('you@example.com',
--         encode(digest('TESTTOKEN123', 'sha256'), 'hex'),
--         'approved', now(), now() + interval '24 hours');
--
-- Then go to /edit-access and paste:  TESTTOKEN123
