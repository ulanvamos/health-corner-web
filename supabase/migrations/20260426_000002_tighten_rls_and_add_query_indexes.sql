create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.users
    where id = (select auth.uid())
      and role = 'admin'
      and is_active = true
  );
$$;

create index if not exists idx_anamnesis_client_id on public.anamnesis (client_id);
create index if not exists idx_appointments_client_id on public.appointments (client_id);
create index if not exists idx_appointments_dietitian_user_id on public.appointments (dietitian_user_id);
create index if not exists idx_appointments_dietitian_requested_at on public.appointments (dietitian_user_id, requested_at desc);
create index if not exists idx_client_menu_days_client_sort on public.client_menu_days (client_id, sort_order);
create index if not exists idx_client_menu_meals_day_sort on public.client_menu_meals (day_id, sort_order);
create index if not exists idx_client_plan_sections_client_sort on public.client_plan_sections (client_id, sort_order);
create index if not exists idx_diet_plans_client_id on public.diet_plans (client_id);
create index if not exists idx_diet_plans_updated_by on public.diet_plans (updated_by);
create index if not exists idx_diet_template_days_template_id on public.diet_template_days (template_id);
create index if not exists idx_diet_template_meals_day_id on public.diet_template_meals (day_id);
create index if not exists idx_diet_templates_dietitian_id on public.diet_templates (dietitian_id);
create index if not exists idx_dietitian_profiles_user_id on public.dietitian_profiles (user_id);
create index if not exists idx_measurements_client_recorded_at on public.measurements (client_id, recorded_at desc);
create index if not exists idx_messages_dietitian_sent on public.messages (dietitian_user_id, sent_at);
create index if not exists idx_notifications_dietitian_sent on public.notifications (dietitian_user_id, sent_at desc);
create index if not exists idx_subscriptions_assigned_by on public.subscriptions (assigned_by);

alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.appointments enable row level security;

drop policy if exists "Allow public select on users" on public.users;
drop policy if exists "users_public_select" on public.users;
create policy "users_public_select"
on public.users
for select
to public
using (true);

drop policy if exists "users_insert_self" on public.users;
create policy "users_insert_self"
on public.users
for insert
to authenticated
with check (id = (select auth.uid()) or public.is_admin());

drop policy if exists "users_admin_update" on public.users;
create policy "users_admin_update"
on public.users
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Clients self view" on public.clients;
drop policy if exists "Users view own clients" on public.clients;
drop policy if exists "clients_own_or_admin" on public.clients;
drop policy if exists "clients_select_visible" on public.clients;
drop policy if exists "clients_insert_self_or_admin" on public.clients;
drop policy if exists "clients_update_visible" on public.clients;

create policy "clients_select_visible"
on public.clients
for select
to authenticated
using (
  public.is_admin()
  or user_id = (select auth.uid())
  or dietitian_user_id = (select auth.uid())
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

create policy "clients_insert_self_or_admin"
on public.clients
for insert
to authenticated
with check (public.is_admin() or user_id = (select auth.uid()));

create policy "clients_update_visible"
on public.clients
for update
to authenticated
using (
  public.is_admin()
  or user_id = (select auth.uid())
  or dietitian_user_id = (select auth.uid())
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
  or user_id = (select auth.uid())
  or dietitian_user_id = (select auth.uid())
);

drop policy if exists "Users insert own appts" on public.appointments;
drop policy if exists "Users view own appts" on public.appointments;
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

create policy "appointments_insert_visible"
on public.appointments
for insert
to authenticated
with check (
  public.is_admin()
  or dietitian_user_id = (select auth.uid())
  or client_id in (
    select c.id
    from public.clients c
    where c.user_id = (select auth.uid())
       or c.dietitian_user_id = (select auth.uid())
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
)
with check (
  public.is_admin()
  or dietitian_user_id = (select auth.uid())
  or client_id in (
    select c.id
    from public.clients c
    where c.user_id = (select auth.uid())
  )
);
