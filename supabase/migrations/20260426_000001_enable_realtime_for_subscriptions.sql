do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if exists (
      select 1
      from information_schema.tables
      where table_schema = 'public'
        and table_name = 'subscriptions'
    ) and not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'subscriptions'
    ) then
      alter publication supabase_realtime add table public.subscriptions;
    end if;
  end if;
end $$;
