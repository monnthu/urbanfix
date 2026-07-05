-- UrbanFix — Esquema inicial nativo de Supabase
-- Usa auth.users (Supabase Auth: Gmail OAuth + MFA)

create extension if not exists pgcrypto;

create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    role text not null check (role in ('civilian', 'institution')) default 'civilian',
    full_name text,
    created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, full_name)
    values (new.id, new.raw_user_meta_data->>'full_name');
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

create table public.institutions (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null unique references public.profiles(id) on delete cascade,
    name varchar(200) not null,
    official_domain varchar(200) not null,
    category varchar(100),
    zone varchar(100),
    status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
    created_at timestamptz not null default now(),
    reviewed_at timestamptz
);

create table public.reports (
    id uuid primary key default gen_random_uuid(),
    title varchar(200) not null,
    description varchar(2000) not null,
    category int not null,
    priority int,
    latitude numeric(9,6) not null,
    longitude numeric(9,6) not null,
    civilian_user_id uuid not null references auth.users(id) on delete cascade,
    institution_id uuid references public.institutions(id),
    status int not null default 0,
    ai_category text,
    ai_priority text,
    ai_confidence numeric(4,3),
    created_at timestamptz not null default now(),
    updated_at timestamptz
);

create index idx_reports_institution_id on public.reports (institution_id);
create index idx_reports_civilian_user_id on public.reports (civilian_user_id);
create index idx_reports_category on public.reports (category);

create table public.report_images (
    id uuid primary key default gen_random_uuid(),
    report_id uuid not null references public.reports(id) on delete cascade,
    storage_path varchar(500),
    thumbnail_path varchar(500),
    content_type varchar(50) not null,
    file_size_bytes bigint not null,
    sort_order smallint not null default 0,
    created_at timestamptz not null default now(),
    image_data bytea
);

create index idx_report_images_report_id on public.report_images (report_id);

create table public.report_supports (
    id uuid primary key default gen_random_uuid(),
    report_id uuid not null references public.reports(id) on delete cascade,
    civilian_user_id uuid not null references auth.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    unique (report_id, civilian_user_id)
);

create index idx_report_supports_report_id on public.report_supports (report_id);

alter table public.profiles enable row level security;
alter table public.institutions enable row level security;
alter table public.reports enable row level security;
alter table public.report_images enable row level security;
alter table public.report_supports enable row level security;

create policy "profiles_select_own"
    on public.profiles for select using (auth.uid() = id);

create policy "profiles_update_own"
    on public.profiles for update using (auth.uid() = id);

create policy "institutions_select_all"
    on public.institutions for select using (true);

create policy "institutions_insert_own"
    on public.institutions for insert
    with check (auth.uid() = profile_id);

create policy "reports_select_all"
    on public.reports for select using (true);

create policy "reports_insert_own"
    on public.reports for insert
    with check (auth.uid() = civilian_user_id);

create policy "reports_update_owner_or_institution"
    on public.reports for update
    using (
        auth.uid() = civilian_user_id
        or institution_id in (
            select id from public.institutions where profile_id = auth.uid()
        )
    );

create policy "report_images_select_all"
    on public.report_images for select using (true);

create policy "report_images_insert_owner"
    on public.report_images for insert
    with check (
        report_id in (
            select id from public.reports where civilian_user_id = auth.uid()
        )
    );

create policy "report_supports_select_all"
    on public.report_supports for select using (true);

create policy "report_supports_insert_own"
    on public.report_supports for insert
    with check (auth.uid() = civilian_user_id);

create policy "report_supports_delete_own"
    on public.report_supports for delete
    using (auth.uid() = civilian_user_id);

-- Storage bucket (opcional — ejecutar si usas Supabase Storage en vez de bytea)
insert into storage.buckets (id, name, public)
values ('report-images', 'report-images', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload report images"
on storage.objects for insert to authenticated
with check (bucket_id = 'report-images');

create policy "Anyone can view report images"
on storage.objects for select using (bucket_id = 'report-images');
