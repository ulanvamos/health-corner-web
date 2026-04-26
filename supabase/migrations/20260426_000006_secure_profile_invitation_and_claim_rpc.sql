create or replace function public.update_own_profile(
  profile_name text,
  profile_title text,
  profile_bio text,
  profile_avatar_url text
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Oturum bulunamadı.';
  end if;

  update public.users
  set
    name = coalesce(nullif(btrim(profile_name), ''), name),
    title = nullif(btrim(profile_title), ''),
    bio = nullif(btrim(profile_bio), ''),
    avatar_url = nullif(btrim(profile_avatar_url), '')
  where id = (select auth.uid());

  if not found then
    raise exception 'Profil kaydı bulunamadı.';
  end if;
end;
$$;

create or replace function public.clear_own_temp_password()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Oturum bulunamadı.';
  end if;

  update public.users
  set temp_password = null
  where id = (select auth.uid());
end;
$$;

create or replace function public.mark_dietitian_invitation_used(invitation_token text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not exists (
    select 1
    from public.users u
    where u.id = (select auth.uid())
      and u.role = 'dietitian'
  ) then
    raise exception 'Diyetisyen hesabı bulunamadı.';
  end if;

  update public.invitations i
  set is_used = true
  where i.token = invitation_token
    and i.role = 'dietitian'
    and coalesce(i.is_used, false) = false
    and coalesce(i.expires_at, now() + interval '1 second') > now();

  if not found then
    raise exception 'Davet bağlantısı geçersiz veya daha önce kullanılmış.';
  end if;
end;
$$;

create or replace function public.claim_client(target_client_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_active_dietitian() then
    raise exception 'Bu işlem için aktif diyetisyen hesabı gerekir.';
  end if;

  if not public.can_claim_unassigned_client(target_client_id) then
    raise exception 'Danışanı üstlenmek için tamamlanmış ilk görüşme gerekir.';
  end if;

  update public.clients
  set
    dietitian_user_id = (select auth.uid()),
    status = 'active',
    goal_label = 'Aktif Danışan'
  where id = target_client_id
    and dietitian_user_id is null;

  if not found then
    raise exception 'Danışan zaten başka bir diyetisyene atanmış olabilir.';
  end if;
end;
$$;
