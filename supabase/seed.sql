-- Seed zones, institutions, and optional demo reports
-- Run after 001_initial_schema.sql

insert into public.institutions (id, name, email_domain, category_coverage, zone_coverage, status)
values
  ('11111111-1111-1111-1111-111111111101', 'Public Works Dept', 'publicworks.gov', array['pothole','streetlight'], array['zone_1','zone_2'], 'approved'),
  ('11111111-1111-1111-1111-111111111102', 'Sanitation Services', 'sanitation.gov', array['garbage'], array['zone_1','zone_2','zone_3'], 'approved'),
  ('11111111-1111-1111-1111-111111111103', 'Water Authority', 'water.gov', array['water_leak','flooding'], array['zone_2','zone_3'], 'approved')
on conflict do nothing;

-- Demo reports require real auth.users UUIDs; add after first civilian signup:
-- insert into public.reports (title, description, category, latitude, longitude, civilian_user_id, assigned_institution_id)
-- values ('Sample pothole', 'Large pothole on Main St', 'pothole', 19.4326, -99.1332, '<civilian-uuid>', '11111111-1111-1111-1111-111111111101');
