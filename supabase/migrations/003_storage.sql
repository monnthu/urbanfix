-- Storage bucket and policies for report images

insert into storage.buckets (id, name, public)
values ('report-images', 'report-images', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload report images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'report-images');

create policy "Anyone can view report images"
on storage.objects for select
using (bucket_id = 'report-images');
