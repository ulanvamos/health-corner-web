drop policy if exists "appointments_update_visible" on public.appointments;

create policy "appointments_update_visible"
on public.appointments
for update
to authenticated
using (
  public.is_admin()
  or dietitian_user_id = (select auth.uid())
  or client_id in (
    select c.id
    from public.clients c
    where c.user_id = (select auth.uid())
  )
  or (
    dietitian_user_id is null
    and exists (
      select 1
      from public.users u
      where u.id = (select auth.uid())
        and u.role = 'dietitian'
        and u.is_active = true
    )
  )
)
with check (
  public.is_admin()
  or dietitian_user_id = (select auth.uid())
  or client_id in (
    select c.id
    from public.clients c
    where c.user_id = (select auth.uid())
  )
  or (
    dietitian_user_id is null
    and exists (
      select 1
      from public.users u
      where u.id = (select auth.uid())
        and u.role = 'dietitian'
        and u.is_active = true
    )
  )
);
