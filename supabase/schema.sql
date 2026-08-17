-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query).

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_]{3,20}$'),
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- storage bucket for avatars / backgrounds / music, one folder per user
insert into storage.buckets (id, name, public)
values ('user-assets', 'user-assets', true)
on conflict (id) do nothing;

create policy "public can view user assets"
  on storage.objects for select
  using (bucket_id = 'user-assets');

create policy "users can upload their own assets"
  on storage.objects for insert
  with check (bucket_id = 'user-assets' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users can update their own assets"
  on storage.objects for update
  using (bucket_id = 'user-assets' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users can delete their own assets"
  on storage.objects for delete
  using (bucket_id = 'user-assets' and (storage.foldername(name))[1] = auth.uid()::text);
