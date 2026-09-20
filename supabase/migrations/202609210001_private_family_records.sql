-- Run once in the Supabase SQL editor. No service role key is used by the app.
begin;
create table public.custom_places (
  id text primary key check (id ~ '^user-[0-9a-f-]{36}$'),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  data jsonb not null check (jsonb_typeof(data) = 'object' and data->>'id' = id and data->>'recommendationSource' = 'USER_ADDED'),
  created_at timestamptz not null default now()
);
create table public.saved_plans (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  data jsonb not null check (jsonb_typeof(data) = 'object' and jsonb_typeof(data->'ids') = 'array' and jsonb_array_length(data->'ids') <= 30)
);
create table public.visit_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  place_id text not null,
  title text not null default '' check (char_length(title) <= 200),
  object_path text not null unique check (object_path = user_id::text || '/' || id::text || '.jpg'),
  image_url text generated always as ('/storage/v1/object/authenticated/visit-photos/' || object_path) stored,
  original_filename text check (char_length(original_filename) <= 250),
  created_at timestamptz not null default now()
);
create index custom_places_owner on public.custom_places(user_id, created_at desc);
create index visit_photos_owner_place on public.visit_photos(user_id, place_id, created_at desc);
alter table public.custom_places enable row level security;
alter table public.saved_plans enable row level security;
alter table public.visit_photos enable row level security;
revoke all on public.custom_places, public.saved_plans, public.visit_photos from anon;
grant select, insert, delete on public.custom_places, public.visit_photos to authenticated;
grant select, insert, update, delete on public.saved_plans to authenticated;
create policy own_places_read on public.custom_places for select to authenticated using (user_id = (select auth.uid()));
create policy own_places_insert on public.custom_places for insert to authenticated with check (user_id = (select auth.uid()));
create policy own_places_delete on public.custom_places for delete to authenticated using (user_id = (select auth.uid()));
create policy own_plan on public.saved_plans for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy own_photos_read on public.visit_photos for select to authenticated using (user_id = (select auth.uid()));
create policy own_photos_insert on public.visit_photos for insert to authenticated with check (
  user_id = (select auth.uid()) and (
    place_id ~ '^([1-9]|[12][0-9]|30)$' or exists (
      select 1 from public.custom_places p where p.id = place_id and p.user_id = (select auth.uid())
    )
  )
);
create policy own_photos_delete on public.visit_photos for delete to authenticated using (user_id = (select auth.uid()));
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('visit-photos', 'visit-photos', false, 10485760, array['image/jpeg']);
-- The UI accepts JPG/PNG/WEBP, but only the metadata-free JPEG is uploaded.
create policy own_visit_upload on storage.objects for insert to authenticated with check (
  bucket_id = 'visit-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
  and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.jpg$'
);
create policy own_visit_read on storage.objects for select to authenticated using (
  bucket_id = 'visit-photos' and (storage.foldername(name))[1] = (select auth.uid())::text and owner_id = (select auth.uid())::text
);
create policy own_visit_delete on storage.objects for delete to authenticated using (
  bucket_id = 'visit-photos' and (storage.foldername(name))[1] = (select auth.uid())::text and owner_id = (select auth.uid())::text
);
commit;
