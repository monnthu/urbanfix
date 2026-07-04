-- UrbanFix / Civic Reporting — full Supabase setup (run once in SQL Editor)
-- Run this entire script after creating a new Supabase project.

-- ========== 001: Schema ==========
create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'civilian' check (role in ('civilian', 'institution', 'admin')),
  display_name text,
  institution_id uuid,
  mfa_enrolled boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.institutions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email_domain text not null,
  category_coverage text[] not null default '{}',
  zone_coverage text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.profiles
  drop constraint if exists profiles_institution_id_fkey;
alter table public.profiles
  add constraint profiles_institution_id_fkey
  foreign key (institution_id) references public.institutions (id);

create table if not exists public.institution_applications (
  id uuid primary key default uuid_generate_v4(),
  applicant_user_id uuid not null references auth.users (id) on delete cascade,
  institution_name text not null,
  official_email text not null,
  category_coverage text[] not null default '{}',
  zone_coverage text[] not null default '{}',
  document_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  category text not null,
  ai_category text,
  priority text not null default 'medium',
  ai_priority text,
  latitude double precision not null,
  longitude double precision not null,
  address_text text,
  image_url text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  civilian_user_id uuid not null references auth.users (id) on delete cascade,
  assigned_institution_id uuid references public.institutions (id),
  created_at timestamptz not null default now()
);

create table if not exists public.report_supports (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid not null references public.reports (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (report_id, user_id)
);

create table if not exists public.ai_interactions (
  id uuid primary key default uuid_generate_v4(),
  institution_user_id uuid not null references auth.users (id) on delete cascade,
  question text not null,
  answer text not null,
  referenced_report_ids uuid[] default '{}',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.institutions enable row level security;
alter table public.institution_applications enable row level security;
alter table public.reports enable row level security;
alter table public.report_supports enable row level security;
alter table public.ai_interactions enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Authenticated users can view approved institutions" on public.institutions;
create policy "Authenticated users can view approved institutions" on public.institutions
  for select using (auth.role() = 'authenticated' and status = 'approved');

drop policy if exists "Authenticated users can view reports" on public.reports;
create policy "Authenticated users can view reports" on public.reports
  for select using (auth.role() = 'authenticated');
drop policy if exists "Civilians can create reports" on public.reports;
create policy "Civilians can create reports" on public.reports
  for insert with check (auth.uid() = civilian_user_id);

drop policy if exists "Authenticated users can view supports" on public.report_supports;
create policy "Authenticated users can view supports" on public.report_supports
  for select using (auth.role() = 'authenticated');
drop policy if exists "Users can support reports once" on public.report_supports;
create policy "Users can support reports once" on public.report_supports
  for insert with check (auth.uid() = user_id);

drop policy if exists "Applicants can view own applications" on public.institution_applications;
create policy "Applicants can view own applications" on public.institution_applications
  for select using (auth.uid() = applicant_user_id);
drop policy if exists "Applicants can submit applications" on public.institution_applications;
create policy "Applicants can submit applications" on public.institution_applications
  for insert with check (auth.uid() = applicant_user_id);

-- ========== 002: Institution policies ==========
drop policy if exists "Institution users can update assigned reports" on public.reports;
create policy "Institution users can update assigned reports"
  on public.reports for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'institution'
        and p.institution_id = reports.assigned_institution_id
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'institution'
        and p.institution_id = reports.assigned_institution_id
    )
  );

drop policy if exists "Institution users can view own ai interactions" on public.ai_interactions;
create policy "Institution users can view own ai interactions"
  on public.ai_interactions for select using (auth.uid() = institution_user_id);
drop policy if exists "Institution users can insert ai interactions" on public.ai_interactions;
create policy "Institution users can insert ai interactions"
  on public.ai_interactions for insert with check (auth.uid() = institution_user_id);

-- ========== 003: Storage ==========
insert into storage.buckets (id, name, public)
values ('report-images', 'report-images', true)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can upload report images" on storage.objects;
create policy "Authenticated users can upload report images"
on storage.objects for insert to authenticated
with check (bucket_id = 'report-images');

drop policy if exists "Anyone can view report images" on storage.objects;
create policy "Anyone can view report images"
on storage.objects for select using (bucket_id = 'report-images');

-- ========== Seed ==========
insert into public.institutions (id, name, email_domain, category_coverage, zone_coverage, status)
values
  ('11111111-1111-1111-1111-111111111101', 'Public Works Dept', 'publicworks.gov', array['pothole','streetlight'], array['zone_1','zone_2'], 'approved'),
  ('11111111-1111-1111-1111-111111111102', 'Sanitation Services', 'sanitation.gov', array['garbage'], array['zone_1','zone_2','zone_3'], 'approved'),
  ('11111111-1111-1111-1111-111111111103', 'Water Authority', 'water.gov', array['water_leak','flooding'], array['zone_2','zone_3'], 'approved')
on conflict (id) do nothing;

-- Demo report (optional — requires a real auth user id)
-- insert into public.reports (title, description, category, latitude, longitude, address_text, civilian_user_id, assigned_institution_id)
-- values ('Demo pothole', 'Sample report for tryouts', 'pothole', 19.4326, -99.1332, 'zone_1', 'YOUR_USER_UUID', '11111111-1111-1111-1111-111111111101');
