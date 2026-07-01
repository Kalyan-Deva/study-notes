-- Run this in your Supabase project: SQL Editor → New query → paste → Run.
-- Adds a moderation queue to posts: public submissions land as 'pending' and
-- stay invisible until the admin approves them. Existing rows default to
-- 'published' so nothing disappears.

alter table public.posts add column if not exists status text not null default 'published';
alter table public.posts add column if not exists submitter_email text;
alter table public.posts add column if not exists email_confirmed boolean not null default false;
alter table public.posts add column if not exists confirm_token text;

create index if not exists posts_status_idx on public.posts (status);

-- status values: 'published' (public), 'pending' (awaiting confirm + review),
-- 'rejected'. Public reads already go through the service role in server code,
-- which now filters status = 'published'.
