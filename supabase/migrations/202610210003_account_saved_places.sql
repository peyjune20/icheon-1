-- Run after 202609210001_private_family_records.sql.
-- Adds account bookmarks only. Guest bookmarks and the 30 seed places are untouched.
begin;
create table if not exists public.saved_places (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  place_id text not null check (place_id ~ '^([1-9]|[12][0-9]|30)$' or place_id ~ '^user-[0-9a-f-]{36}$'),
  created_at timestamptz not null default now(),
  custom_place_id text generated always as (case when place_id like 'user-%' then place_id end) stored
    references public.custom_places(id) on delete cascade,
  primary key (user_id, place_id)
);
create index if not exists saved_places_owner_date on public.saved_places(user_id, created_at desc);
alter table public.saved_places enable row level security;
revoke all on public.saved_places from anon, authenticated;
grant select, insert, delete on public.saved_places to authenticated;
drop policy if exists own_saved_places_read on public.saved_places;
drop policy if exists own_saved_places_insert on public.saved_places;
drop policy if exists own_saved_places_delete on public.saved_places;
create policy own_saved_places_read on public.saved_places for select to authenticated
  using (user_id = (select auth.uid()));
create policy own_saved_places_insert on public.saved_places for insert to authenticated with check (
  user_id = (select auth.uid()) and (
    custom_place_id is null or exists (
      select 1 from public.custom_places p where p.id = place_id and p.user_id = (select auth.uid())
    )
  )
);
create policy own_saved_places_delete on public.saved_places for delete to authenticated
  using (user_id = (select auth.uid()));
commit;
