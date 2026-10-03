-- =============================================================================
-- BizeLinks — Phase 2: public pages
--
-- Plain-English summary of what changes:
--   * Spotlight now holds up to 3 items (was exactly 1).
--   * The "featured" zone is renamed "products"; product cards can show a
--     price the owner types themselves (e.g. "£9.99", "$12", "From €40").
--   * Items can carry a small badge: new, popular, offer or limited.
--   * Social profiles get their own small table (one per platform).
--   * Profiles gain a short descriptor line ("Author and speaker"), a
--     person/organisation flag for search engines, and a "let search engines
--     list my page" switch (on by default).
--   * get_public_page() returns all of the above; a new function lists
--     indexable pages for the sitemap.
--   * More route names are reserved so nobody can claim them as usernames.
--
-- Safe to run once on a database that already has migrations 1 and 2.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Reserved names for routes added in Phase 2 (and a few obvious future ones)
-- ---------------------------------------------------------------------------
insert into public.reserved_usernames (username, reason) values
  ('example','route'),('examples','route'),('demo','route'),('go','route'),
  ('qr','route'),('share','route'),('themes','route'),('templates','route'),
  ('start','route'),('get-started','route'),('creators','route'),('business','route'),
  ('shop','route'),('store','route'),('abuse','system'),('moderator','system'),
  ('assets','route'),('_next','system'),('favicon','route'),('manifest','route')
on conflict (username) do nothing;

-- ---------------------------------------------------------------------------
-- Profiles: descriptor, entity type, search-engine switch
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column descriptor   text    not null default ''       check (char_length(descriptor) <= 60),
  add column entity_type  text    not null default 'person' check (entity_type in ('person','organization')),
  add column is_indexable boolean not null default true;

grant update (descriptor, entity_type, is_indexable) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Page items: featured → products, spotlight cap 3, price and badge
-- ---------------------------------------------------------------------------
drop index if exists public.page_items_one_spotlight;

alter table public.page_items drop constraint if exists page_items_zone_check;
update public.page_items set zone = 'products' where zone = 'featured';
alter table public.page_items
  add constraint page_items_zone_check check (zone in ('spotlight','products','links')),
  add column price_label text check (price_label is null or char_length(btrim(price_label)) between 1 and 20),
  add column badge       text check (badge is null or badge in ('new','popular','offer','limited'));

-- Caps keep pages readable and slow down spam pages. Mirrors src/lib/plans.ts.
-- The advisory lock stops two simultaneous saves from both slipping under a cap.
create or replace function public.guard_item_caps()
returns trigger language plpgsql as $$
declare
  n integer;
begin
  if tg_op = 'UPDATE' and new.zone = old.zone and new.profile_id = old.profile_id then
    return new;
  end if;
  perform pg_advisory_xact_lock(hashtext('page_items:' || new.profile_id::text));
  select count(*) into n from public.page_items
   where profile_id = new.profile_id and zone = new.zone and id <> new.id;
  if new.zone = 'spotlight' and n >= 3 then
    raise exception 'spotlight_limit' using errcode = 'P0001';
  elsif new.zone = 'products' and n >= 12 then
    raise exception 'products_limit' using errcode = 'P0001';
  elsif new.zone = 'links' and n >= 50 then
    raise exception 'links_limit' using errcode = 'P0001';
  end if;
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Social profiles: one row per platform per page
-- ---------------------------------------------------------------------------
create table public.social_links (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  provider    text not null check (provider in (
                'instagram','tiktok','youtube','facebook','linkedin','x','threads','pinterest',
                'snapchat','spotify','whatsapp','telegram','discord','github','email','website')),
  url         text not null check (char_length(url) <= 2048 and (
                (provider =  'email' and url ~* '^mailto:[^\s@/?#]+@[^\s@/?#]+\.[^\s@/?#]+$') or
                (provider <> 'email' and url ~* '^https?://[^\s/$.?#].[^\s]*$'))),
  position    integer not null default 0 check (position >= 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (profile_id, provider)
);
create index social_links_profile_idx on public.social_links (profile_id, position);

create trigger social_links_touch before update on public.social_links
  for each row execute function public.touch_updated_at();

alter table public.social_links enable row level security;
grant select, insert, update, delete on public.social_links to authenticated;

create policy socials_select_own on public.social_links for select to authenticated
  using (profile_id = (select auth.uid()));
create policy socials_insert_own on public.social_links for insert to authenticated
  with check (profile_id = (select auth.uid()));
create policy socials_update_own on public.social_links for update to authenticated
  using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));
create policy socials_delete_own on public.social_links for delete to authenticated
  using (profile_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Public page: everything a visitor may see, as one JSON object
-- ---------------------------------------------------------------------------
create or replace function public.get_public_page(p_username text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'username',     p.username,
    'display_name', p.display_name,
    'descriptor',   p.descriptor,
    'bio',          p.bio,
    'location',     p.location,
    'avatar_path',  p.avatar_path,
    'entity_type',  p.entity_type,
    'is_indexable', p.is_indexable,
    'theme',        p.theme,
    'accent',       p.accent,
    'updated_at',   p.updated_at,
    'socials', coalesce((
      select jsonb_agg(jsonb_build_object('provider', s.provider, 'url', s.url)
             order by s.position, s.created_at)
        from social_links s
       where s.profile_id = p.id), '[]'::jsonb),
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', i.id, 'zone', i.zone, 'kind', i.kind, 'title', i.title,
               'url', i.url, 'description', i.description, 'image_path', i.image_path,
               'cta_label', i.cta_label, 'price_label', i.price_label, 'badge', i.badge,
               'position', i.position)
             order by case i.zone when 'spotlight' then 0 when 'products' then 1 else 2 end,
                      i.position, i.created_at)
        from page_items i
       where i.profile_id = p.id and i.is_visible), '[]'::jsonb)
  )
  from profiles p
  where p.username = lower(btrim(p_username))
    and p.is_published
    and not p.is_suspended;
$$;

-- Pages whose owners chose to be listed by search engines.
create or replace function public.list_indexable_pages()
returns table (username text, updated_at timestamptz)
language sql stable security definer set search_path = public as $$
  select p.username, p.updated_at
    from profiles p
   where p.is_published and p.is_indexable and not p.is_suspended
   order by p.updated_at desc
   limit 45000;
$$;

revoke all on function public.list_indexable_pages() from public;
grant execute on function public.list_indexable_pages() to anon, authenticated;
