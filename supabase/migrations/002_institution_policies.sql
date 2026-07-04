-- Institution dashboard + AI interaction policies

create policy "Institution users can update assigned reports"
  on public.reports
  for update
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'institution'
        and p.institution_id = reports.assigned_institution_id
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'institution'
        and p.institution_id = reports.assigned_institution_id
    )
  );

create policy "Institution users can view own ai interactions"
  on public.ai_interactions
  for select
  using (auth.uid() = institution_user_id);

create policy "Institution users can insert ai interactions"
  on public.ai_interactions
  for insert
  with check (auth.uid() = institution_user_id);
