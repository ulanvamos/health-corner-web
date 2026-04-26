alter function public.handle_premium_subscription() set search_path = public, auth, extensions;
alter function public.claim_client(uuid) set search_path = public, auth, extensions;
alter function public.notify_appointment_update() set search_path = public, auth, extensions;
alter function public.admin_set_user_password(uuid, text) set search_path = public, auth, extensions;
alter function public.admin_create_dietitian(text, text, text) set search_path = public, auth, extensions;
alter function public.create_dietitian_invitation() set search_path = public, auth, extensions;
alter function public.handle_new_user() set search_path = public, auth, extensions;

drop policy if exists "Users manage own anamnesis" on public.anamnesis;
drop policy if exists "Clients can manage their own anamnesis" on public.anamnesis;
drop policy if exists "Dietitians can view assigned client anamnesis" on public.anamnesis;

create policy "anamnesis_client_manage_own"
on public.anamnesis
for all
to authenticated
using (
  client_id in (
    select c.id from public.clients c where c.user_id = (select auth.uid())
  )
)
with check (
  client_id in (
    select c.id from public.clients c where c.user_id = (select auth.uid())
  )
);

create policy "anamnesis_dietitian_select_assigned"
on public.anamnesis
for select
to authenticated
using (
  public.is_admin()
  or client_id in (
    select c.id from public.clients c where c.dietitian_user_id = (select auth.uid())
  )
);

drop policy if exists "Users manage own measurements" on public.measurements;
drop policy if exists "Clients can manage their own measurements" on public.measurements;
drop policy if exists "Dietitians can view assigned client measurements" on public.measurements;

create policy "measurements_client_manage_own"
on public.measurements
for all
to authenticated
using (
  client_id in (
    select c.id from public.clients c where c.user_id = (select auth.uid())
  )
)
with check (
  client_id in (
    select c.id from public.clients c where c.user_id = (select auth.uid())
  )
);

create policy "measurements_dietitian_manage_assigned"
on public.measurements
for all
to authenticated
using (
  public.is_admin()
  or client_id in (
    select c.id from public.clients c where c.dietitian_user_id = (select auth.uid())
  )
)
with check (
  public.is_admin()
  or client_id in (
    select c.id from public.clients c where c.dietitian_user_id = (select auth.uid())
  )
);

drop policy if exists "Templates are public" on public.diet_templates;
drop policy if exists "Template days are public" on public.diet_template_days;
drop policy if exists "Template meals are public" on public.diet_template_meals;

create policy "diet_templates_select_authenticated"
on public.diet_templates
for select
to authenticated
using (true);

create policy "diet_templates_manage_owner_or_admin"
on public.diet_templates
for all
to authenticated
using (public.is_admin() or dietitian_id = (select auth.uid()))
with check (public.is_admin() or dietitian_id = (select auth.uid()));

create policy "diet_template_days_select_authenticated"
on public.diet_template_days
for select
to authenticated
using (true);

create policy "diet_template_days_manage_owner_or_admin"
on public.diet_template_days
for all
to authenticated
using (
  public.is_admin()
  or template_id in (
    select t.id from public.diet_templates t where t.dietitian_id = (select auth.uid())
  )
)
with check (
  public.is_admin()
  or template_id in (
    select t.id from public.diet_templates t where t.dietitian_id = (select auth.uid())
  )
);

create policy "diet_template_meals_select_authenticated"
on public.diet_template_meals
for select
to authenticated
using (true);

create policy "diet_template_meals_manage_owner_or_admin"
on public.diet_template_meals
for all
to authenticated
using (
  public.is_admin()
  or day_id in (
    select d.id
    from public.diet_template_days d
    join public.diet_templates t on t.id = d.template_id
    where t.dietitian_id = (select auth.uid())
  )
)
with check (
  public.is_admin()
  or day_id in (
    select d.id
    from public.diet_template_days d
    join public.diet_templates t on t.id = d.template_id
    where t.dietitian_id = (select auth.uid())
  )
);

drop policy if exists "admin_users_admin_only" on public.admin_users;
create policy "admin_users_admin_only"
on public.admin_users
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "applications_own_or_admin" on public.dietitian_applications;
create policy "applications_own_or_admin"
on public.dietitian_applications
for all
to authenticated
using (user_id = (select auth.uid()) or public.is_admin())
with check (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "dietitian_profiles_owner_or_admin" on public.dietitian_profiles;
create policy "dietitian_profiles_owner_or_admin"
on public.dietitian_profiles
for all
to authenticated
using (user_id = (select auth.uid()) or public.is_admin())
with check (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "dietitians_own_or_admin" on public.dietitians;
create policy "dietitians_own_or_admin"
on public.dietitians
for all
to authenticated
using (user_id = (select auth.uid()) or public.is_admin())
with check (user_id = (select auth.uid()) or public.is_admin());
