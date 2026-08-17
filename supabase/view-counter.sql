-- Run in the Supabase SQL Editor. Adds a real, reliable view counter
-- to replace the old countapi.xyz dependency.

create table public.page_views (
  namespace text primary key,
  count bigint not null default 0
);

alter table public.page_views enable row level security;

create policy "page views are publicly readable"
  on public.page_views for select
  using (true);

create or replace function public.increment_view(ns text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count bigint;
begin
  insert into public.page_views (namespace, count)
  values (ns, 1)
  on conflict (namespace) do update set count = page_views.count + 1
  returning count into new_count;
  return new_count;
end;
$$;

grant execute on function public.increment_view(text) to anon;
