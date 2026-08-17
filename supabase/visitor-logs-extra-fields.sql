-- Run in the Supabase SQL Editor to add the extra visitor detail columns.
alter table public.visitor_logs
  add column if not exists referrer text,
  add column if not exists device text,
  add column if not exists browser text,
  add column if not exists screen text,
  add column if not exists language text,
  add column if not exists timezone text,
  add column if not exists visit_count int;
