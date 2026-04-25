-- Health Corner account model for Supabase.
-- Run this in the Supabase SQL Editor for the healtcorner project.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null check (role in ('client', 'dietitian', 'admin')),
  status text not null default 'active' check (status in ('active', 'pending', 'rejected', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dietitians (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  title text,
  bio text,
  license_number text,
  specialty text,
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  dietitian_id uuid references public.dietitians(id) on delete set null,
  age int,
  height_cm int,
  goal_type text default 'maintain',
  target_summary text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.dietitian_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  license_number text,
  specialty text,
  diploma_file_path text,
  certificate_file_path text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  permission_level text not null default 'owner',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.dietitians enable row level security;
alter table public.dietitian_applications enable row level security;
alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and status = 'active'
  );
$$;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
with check (id = auth.uid());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles for update
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists "clients_own_or_admin" on public.clients;
create policy "clients_own_or_admin"
on public.clients for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "dietitians_own_or_admin" on public.dietitians;
create policy "dietitians_own_or_admin"
on public.dietitians for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "applications_own_or_admin" on public.dietitian_applications;
create policy "applications_own_or_admin"
on public.dietitian_applications for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "admin_users_admin_only" on public.admin_users;
create policy "admin_users_admin_only"
on public.admin_users for all
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('dietitian-documents', 'dietitian-documents', false)
on conflict (id) do nothing;

drop policy if exists "dietitian_documents_owner_upload" on storage.objects;
create policy "dietitian_documents_owner_upload"
on storage.objects for insert
with check (
  bucket_id = 'dietitian-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "dietitian_documents_owner_or_admin_read" on storage.objects;
create policy "dietitian_documents_owner_or_admin_read"
on storage.objects for select
using (
  bucket_id = 'dietitian-documents'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.is_admin()
  )
);
