-- Civic Reporting Platform — initial schema
-- Run in Supabase SQL Editor or via supabase db push

-- Extensions
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'civilian' check (role in ('civilian', 'institution', 'admin')),
  display_name text,
  institution_id uuid,
  mfa_enrolled boolean not null default false,
  created_at timestamptz not null default now()
);

-- Institutions
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
  add constraint profiles_institution_id_fkey
  foreign key (institution_id) references public.institutions (id);

-- Institution applications
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

-- Reports
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

-- Report supports (verify/support)
create table if not exists public.report_supports (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid not null references public.reports (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (report_id, user_id)
);

-- AI interaction log (institution chat)
create table if not exists public.ai_interactions (
  id uuid primary key default uuid_generate_v4(),
  institution_user_id uuid not null references auth.users (id) on delete cascade,
  question text not null,
  answer text not null,
  referenced_report_ids uuid[] default '{}',
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
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

-- Profiles: users read/update own row
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Institutions: approved institutions readable by all authenticated users
create policy "Authenticated users can view approved institutions" on public.institutions
  for select using (auth.role() = 'authenticated' and status = 'approved');

-- Reports: all authenticated can read; civilians insert own
create policy "Authenticated users can view reports" on public.reports
  for select using (auth.role() = 'authenticated');
create policy "Civilians can create reports" on public.reports
  for insert with check (auth.uid() = civilian_user_id);

-- Report supports
create policy "Authenticated users can view supports" on public.report_supports
  for select using (auth.role() = 'authenticated');
create policy "Users can support reports once" on public.report_supports
  for insert with check (auth.uid() = user_id);

-- Institution applications: applicant can insert/view own
create policy "Applicants can view own applications" on public.institution_applications
  for select using (auth.uid() = applicant_user_id);
create policy "Applicants can submit applications" on public.institution_applications
  for insert with check (auth.uid() = applicant_user_id);

-- Storage bucket (run separately if needed)
-- insert into storage.buckets (id, name, public) values ('report-images', 'report-images', true);
