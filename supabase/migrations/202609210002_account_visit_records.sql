-- Run AFTER 202609210001_private_family_records.sql. Does not modify the 30 seed places.
begin;
create table public.visit_records (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  place_id text not null check (place_id ~ '^([1-9]|[12][0-9]|30)$' or place_id ~ '^user-[0-9a-f-]{36}$'),
  visited_at date not null check (visited_at <= (now() at time zone 'Asia/Seoul')::date),
  created_at timestamptz not null default now(),
  -- A personal place deletion also removes its visit. Seed IDs have no FK.
  custom_place_id text generated always as (case when place_id like 'user-%' then place_id end) stored
    references public.custom_places(id) on delete cascade,
  primary key (user_id, place_id)
);
create index visit_records_owner_date on public.visit_records(user_id, visited_at desc);
alter table public.visit_records enable row level security;
revoke all on public.visit_records from anon, authenticated;
grant select, insert, update, delete on public.visit_records to authenticated;
create policy own_visits_read on public.visit_records for select to authenticated
  using (user_id = (select auth.uid()));
create policy own_visits_insert on public.visit_records for insert to authenticated with check (
  user_id = (select auth.uid()) and (
    custom_place_id is null or exists (
      select 1 from public.custom_places p where p.id = place_id and p.user_id = (select auth.uid())
    )
  )
);
create policy own_visits_update on public.visit_records for update to authenticated
  using (user_id = (select auth.uid())) with check (
    user_id = (select auth.uid()) and (
      custom_place_id is null or exists (
        select 1 from public.custom_places p where p.id = place_id and p.user_id = (select auth.uid())
      )
    )
  );
create policy own_visits_delete on public.visit_records for delete to authenticated
  using (user_id = (select auth.uid()));
commit;
