-- Run this in your Supabase project: SQL Editor → New query → paste → Run.
-- Creates a PUBLIC storage bucket for images embedded in posts/journal notes.
-- Uploads go through the server (/api/upload) using the service-role key, so no
-- public write policy is needed; public = true makes the files readable by URL.

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;
