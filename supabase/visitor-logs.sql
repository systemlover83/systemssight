-- Run in the Supabase SQL Editor.
-- NOTE: by the user's choice, this is intentionally simple/public-readable —
-- reading logged IPs only requires the same public anon key the whole site
-- already uses, gated by nothing but the /dev passcode in the UI (which is
-- client-side only, not real access control). Anyone who inspects the
-- site's code could query this table directly. See conversation/memory
-- for the security tradeoff that was discussed and accepted.

create table public.visitor_logs (
  id bigserial primary key,
  ip text,
  user_agent text,
  page text,
  created_at timestamptz not null default now()
);

alter table public.visitor_logs enable row level security;

create policy "anyone can log a visit"
  on public.visitor_logs for insert
  with check (true);

create policy "logs are readable with the anon key"
  on public.visitor_logs for select
  using (true);
