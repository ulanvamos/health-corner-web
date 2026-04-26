create or replace function public.is_active_dietitian()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.users u
    where u.id = (select auth.uid())
      and u.role = 'dietitian'
      and u.is_active = true
  );
$$;

create or replace function public.can_view_unassigned_client(target_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.is_active_dietitian()
    and exists (
      select 1
      from public.appointments a
      where a.client_id = target_client_id
        and (
          (a.dietitian_user_id is null and a.status = 'pending')
          or (a.dietitian_user_id = (select auth.uid()) and a.status = 'completed')
        )
    );
$$;

create or replace function public.can_claim_unassigned_client(target_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.is_active_dietitian()
    and exists (
      select 1
      from public.appointments a
      where a.client_id = target_client_id
        and a.dietitian_user_id = (select auth.uid())
        and a.status = 'completed'
    );
$$;

drop policy if exists "clients_select_visible" on public.clients;
drop policy if exists "clients_update_visible" on public.clients;

create policy "clients_select_visible"
on public.clients
for select
to authenticated
using (
  public.is_admin()
  or user_id = (select auth.uid())
  or dietitian_user_id = (select auth.uid())
  or (dietitian_user_id is null and public.can_view_unassigned_client(id))
);

create policy "clients_update_visible"
on public.clients
for update
to authenticated
using (
  public.is_admin()
  or user_id = (select auth.uid())
  or dietitian_user_id = (select auth.uid())
  or (dietitian_user_id is null and public.can_claim_unassigned_client(id))
)
with check (
  public.is_admin()
  or user_id = (select auth.uid())
  or dietitian_user_id = (select auth.uid())
);

drop policy if exists "appointments_select_visible" on public.appointments;
drop policy if exists "appointments_insert_visible" on public.appointments;
drop policy if exists "appointments_update_visible" on public.appointments;

create policy "appointments_select_visible"
on public.appointments
for select
to authenticated
using (
  public.is_admin()
  or dietitian_user_id = (select auth.uid())
  or client_id in (
    select c.id
    from public.clients c
    where c.user_id = (select auth.uid())
  )
  or (dietitian_user_id is null and status = 'pending' and public.is_active_dietitian())
);

create policy "appointments_insert_visible"
on public.appointments
for insert
to authenticated
with check (
  public.is_admin()
  or dietitian_user_id = (select auth.uid())
  or exists (
    select 1
    from public.clients c
    where c.id = client_id
      and c.user_id = (select auth.uid())
      and (
        (c.dietitian_user_id is null and appointments.dietitian_user_id is null)
        or (c.dietitian_user_id is not null and appointments.dietitian_user_id = c.dietitian_user_id)
      )
  )
);

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
  or (dietitian_user_id is null and status = 'pending' and public.is_active_dietitian())
)
with check (
  public.is_admin()
  or dietitian_user_id = (select auth.uid())
  or client_id in (
    select c.id
    from public.clients c
    where c.user_id = (select auth.uid())
  )
  or (dietitian_user_id is null and status = 'canceled' and public.is_active_dietitian())
);
