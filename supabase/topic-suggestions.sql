-- Run this in Supabase (SQL Editor) to enable the "Suggest a topic" form.
-- Anyone can submit; submissions are visible only to you in the dashboard
-- (there is no SELECT policy, so the public API can't read them back).

create table if not exists public.topic_suggestions (
  id          uuid primary key default gen_random_uuid(),
  topic       text not null,
  detail      text,
  email       text,
  created_at  timestamptz not null default now()
);

alter table public.topic_suggestions enable row level security;

drop policy if exists "suggestions_insert_anyone" on public.topic_suggestions;
create policy "suggestions_insert_anyone" on public.topic_suggestions
  for insert with check (true);
