-- =============================================================================
-- BizeLinks — core schema (Phase 1)
--
-- Plain-English summary:
--   * profiles        one public page per account (username, name, bio, theme)
--   * page_items      everything on the page: spotlight, featured cards, links
--   * reserved_usernames   names nobody can claim (admin, login, …)
--   * username_history     old usernames, held so they can't be sniped at once
--   * daily_page_views / daily_item_clicks   counts only — no IPs, no visitors
--   * page_reports    "report this page" submissions (open sign-ups need this)
--
-- Security model: Row Level Security is ON for every table. Signed-in users can
-- only read and change their own rows. Anonymous visitors cannot read any table
-- directly — they get public pages only through get_public_page(), which returns
-- a fixed list of public fields for published pages.
-- =============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Reserved usernames
-- ---------------------------------------------------------------------------
create table public.reserved_usernames (
  username text primary key check (username = lower(username)),
  reason   text not null default 'system'
);

insert into public.reserved_usernames (username, reason) values
  ('about','route'),('account','route'),('admin','system'),('administrator','system'),
  ('api','route'),('app','route'),('auth','route'),('billing','route'),('blog','route'),
  ('bizelinks','brand'),('bizelink','brand'),('brand','route'),('careers','route'),
  ('contact','route'),('cookies','route'),('dashboard','route'),('design','route'),
  ('docs','route'),('explore','route'),('faq','route'),('features','route'),
  ('help','route'),('home','route'),('join','route'),('legal','route'),('login','route'),
  ('logout','route'),('mail','system'),('me','route'),('new','route'),('news','route'),
  ('null','system'),('official','brand'),('onboarding','route'),('pricing','route'),
  ('privacy','route'),('profile','route'),('register','route'),('report','route'),
  ('risten','brand'),('ristenglobal','brand'),('root','system'),('security','route'),
  ('settings','route'),('signin','route'),('signout','route'),('signup','route'),
  ('sitemap','route'),('staff','brand'),('static','route'),('status','route'),
  ('styleguide','route'),('support','route'),('system','system'),('team','brand'),
  ('terms','route'),('undefined','system'),('user','route'),('users','route'),
  ('verify','route'),('webmaster','system'),('www','system');

-- ---------------------------------------------------------------------------
-- Profiles (one page per account in the MVP)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  username      text not null unique
                check (username ~ '^[a-z0-9][a-z0-9_-]{2,29}$'),
  display_name  text not null default ''  check (char_length(display_name) <= 60),
  bio           text not null default ''  check (char_length(bio) <= 160),
  location      text not null default ''  check (char_length(location) <= 60),
  avatar_path   text                      check (avatar_path is null or char_length(avatar_path) <= 300),
  theme         text not null default 'paper'
                check (theme in ('paper','studio','ink','lagoon')),
  accent        text not null default '#C8421A'
                check (accent ~ '^#[0-9A-Fa-f]{6}$'),
  is_published  boolean not null default false,
  published_at  timestamptz,
  is_suspended  boolean not null default false,   -- set by staff only (no user policy can change it)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Username rules the CHECK constraint can't express: reserved names, and names
-- recently released by someone else (30-day hold).
create or replace function public.guard_username()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' and new.username = old.username then
    return new;
  end if;
  if exists (select 1 from public.reserved_usernames r where r.username = new.username) then
    raise exception 'username_reserved' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public.username_history h
    where h.old_username = new.username
      and h.profile_id <> new.id
      and h.changed_at > now() - interval '30 days'
  ) then
    raise exception 'username_on_hold' using errcode = 'P0001';
  end if;
  return new;
end $$;

-- Users may not flip the staff-only suspension flag or backdate publishing.
create or replace function public.guard_profile_fields()
returns trigger language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.is_suspended := false;
    elsif new.is_suspended is distinct from old.is_suspended then
      raise exception 'not_allowed' using errcode = '42501';
    end if;
  end if;
  if new.is_published and (tg_op = 'INSERT' or not old.is_published) then
    new.published_at := now();
  end if;
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Username history
-- ---------------------------------------------------------------------------
create table public.username_history (
  id            bigint generated always as identity primary key,
  profile_id    uuid not null references public.profiles (id) on delete cascade,
  old_username  text not null,
  changed_at    timestamptz not null default now()
);
create index username_history_old_idx on public.username_history (old_username, changed_at desc);

create or replace function public.record_username_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.username <> old.username then
    -- Limit: 3 changes per 30 days, so names can't be cycled to squat others.
    if (select count(*) from public.username_history
        where profile_id = new.id and changed_at > now() - interval '30 days') >= 3 then
      raise exception 'username_change_limit' using errcode = 'P0001';
    end if;
    insert into public.username_history (profile_id, old_username) values (old.id, old.username);
  end if;
  return new;
end $$;

create trigger profiles_guard_username before insert or update of username on public.profiles
  for each row execute function public.guard_username();
create trigger profiles_guard_fields before insert or update on public.profiles
  for each row execute function public.guard_profile_fields();
create trigger profiles_username_history after update of username on public.profiles
  for each row execute function public.record_username_change();

-- ---------------------------------------------------------------------------
-- Page items: spotlight / featured / links
-- "zone" is WHERE an item sits on the page; "kind" is WHAT it is. Any kind can
-- go in any zone. New section types later = new kinds, no new tables.
-- ---------------------------------------------------------------------------
create table public.page_items (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles (id) on delete cascade,
  zone         text not null default 'links' check (zone in ('spotlight','featured','links')),
  kind         text not null default 'link'
               check (kind in ('link','product','service','content','booking','newsletter','event')),
  title        text not null check (char_length(btrim(title)) between 1 and 80),
  url          text not null check (char_length(url) <= 2048 and url ~* '^https?://[^\s/$.?#].[^\s]*$'),
  description  text not null default '' check (char_length(description) <= 200),
  image_path   text check (image_path is null or char_length(image_path) <= 300),
  cta_label    text check (cta_label is null or char_length(btrim(cta_label)) between 1 and 24),
  position     integer not null default 0 check (position >= 0),
  is_visible   boolean not null default true,
  settings     jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index page_items_profile_idx on public.page_items (profile_id, zone, position);
-- Exactly one spotlight per page, enforced by the database itself.
create unique index page_items_one_spotlight on public.page_items (profile_id) where zone = 'spotlight';

create trigger page_items_touch before update on public.page_items
  for each row execute function public.touch_updated_at();

-- Caps keep pages readable and slow down spam pages. Mirrors src/lib/plans.ts.
create or replace function public.guard_item_caps()
returns trigger language plpgsql as $$
declare
  n integer;
begin
  if tg_op = 'UPDATE' and new.zone = old.zone and new.profile_id = old.profile_id then
    return new;
  end if;
  select count(*) into n from public.page_items
   where profile_id = new.profile_id and zone = new.zone and id <> new.id;
  if new.zone = 'featured' and n >= 6 then
    raise exception 'featured_limit' using errcode = 'P0001';
  elsif new.zone = 'links' and n >= 50 then
    raise exception 'links_limit' using errcode = 'P0001';
  end if;
  return new;
end $$;

create trigger page_items_caps before insert or update on public.page_items
  for each row execute function public.guard_item_caps();

-- ---------------------------------------------------------------------------
-- Analytics: daily counters only. No IP address, user agent or visitor ID is
-- ever stored. Written only through record_page_view / record_item_click.
-- ---------------------------------------------------------------------------
create table public.daily_page_views (
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  day         date not null,
  views       integer not null default 0 check (views >= 0),
  primary key (profile_id, day)
);

create table public.daily_item_clicks (
  item_id     uuid not null references public.page_items (id) on delete cascade,
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  day         date not null,
  clicks      integer not null default 0 check (clicks >= 0),
  primary key (item_id, day)
);
create index daily_item_clicks_profile_idx on public.daily_item_clicks (profile_id, day);

-- ---------------------------------------------------------------------------
-- Abuse reports
-- ---------------------------------------------------------------------------
create table public.page_reports (
  id          bigint generated always as identity primary key,
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  reason      text not null check (reason in ('spam','scam_or_phishing','malware','impersonation','hate_or_harassment','illegal','other')),
  details     text not null default '' check (char_length(details) <= 1000),
  status      text not null default 'open' check (status in ('open','reviewed','actioned','dismissed')),
  created_at  timestamptz not null default now()
);
create index page_reports_open_idx on public.page_reports (status, created_at desc);

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.profiles           enable row level security;
alter table public.page_items         enable row level security;
alter table public.reserved_usernames enable row level security;
alter table public.username_history   enable row level security;
alter table public.daily_page_views   enable row level security;
alter table public.daily_item_clicks  enable row level security;
alter table public.page_reports       enable row level security;

-- Start from zero: nobody gets anything that isn't granted below.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

-- Profiles: owner only.
grant select, insert, delete on public.profiles to authenticated;
grant update (username, display_name, bio, location, avatar_path, theme, accent, is_published)
  on public.profiles to authenticated;

create policy profiles_select_own on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy profiles_insert_own on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy profiles_delete_own on public.profiles for delete to authenticated
  using (id = (select auth.uid()));

-- Page items: owner only, and only on their own profile.
grant select, insert, update, delete on public.page_items to authenticated;

create policy items_select_own on public.page_items for select to authenticated
  using (profile_id = (select auth.uid()));
create policy items_insert_own on public.page_items for insert to authenticated
  with check (profile_id = (select auth.uid()));
create policy items_update_own on public.page_items for update to authenticated
  using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));
create policy items_delete_own on public.page_items for delete to authenticated
  using (profile_id = (select auth.uid()));

-- Analytics: owners can read their own numbers; nobody writes directly.
grant select on public.daily_page_views, public.daily_item_clicks to authenticated;
create policy views_select_own on public.daily_page_views for select to authenticated
  using (profile_id = (select auth.uid()));
create policy clicks_select_own on public.daily_item_clicks for select to authenticated
  using (profile_id = (select auth.uid()));

-- Username history: owners can see their own past names.
grant select on public.username_history to authenticated;
create policy history_select_own on public.username_history for select to authenticated
  using (profile_id = (select auth.uid()));

-- reserved_usernames and page_reports: no direct access for anyone (functions only).

-- =============================================================================
-- Public functions (the only door anonymous visitors have)
-- =============================================================================

-- Is a username free to claim? Returns 'available' | 'invalid' | 'reserved' | 'taken' | 'on_hold'.
create or replace function public.username_status(p_username text)
returns text language plpgsql stable security definer set search_path = public as $$
declare
  u text := lower(btrim(coalesce(p_username, '')));
begin
  if u !~ '^[a-z0-9][a-z0-9_-]{2,29}$' then return 'invalid'; end if;
  if exists (select 1 from reserved_usernames where username = u) then return 'reserved'; end if;
  if exists (select 1 from profiles where username = u) then return 'taken'; end if;
  if exists (select 1 from username_history where old_username = u
             and changed_at > now() - interval '30 days') then return 'on_hold'; end if;
  return 'available';
end $$;

-- Everything a visitor may see about a published page, as one JSON object.
-- Returns NULL for unknown, unpublished or suspended pages (all look the same
-- from outside, so nobody can probe which usernames exist but are hidden).
create or replace function public.get_public_page(p_username text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'username',     p.username,
    'display_name', p.display_name,
    'bio',          p.bio,
    'location',     p.location,
    'avatar_path',  p.avatar_path,
    'theme',        p.theme,
    'accent',       p.accent,
    'updated_at',   p.updated_at,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', i.id, 'zone', i.zone, 'kind', i.kind, 'title', i.title,
               'url', i.url, 'description', i.description, 'image_path', i.image_path,
               'cta_label', i.cta_label, 'position', i.position)
             order by case i.zone when 'spotlight' then 0 when 'featured' then 1 else 2 end,
                      i.position, i.created_at)
        from page_items i
       where i.profile_id = p.id and i.is_visible), '[]'::jsonb)
  )
  from profiles p
  where p.username = lower(btrim(p_username))
    and p.is_published
    and not p.is_suspended;
$$;

-- Counters. Silently ignore unknown or unpublished pages.
create or replace function public.record_page_view(p_username text)
returns void language plpgsql volatile security definer set search_path = public as $$
declare
  pid uuid;
begin
  select id into pid from profiles
   where username = lower(btrim(p_username)) and is_published and not is_suspended;
  if pid is null then return; end if;
  insert into daily_page_views (profile_id, day, views) values (pid, (now() at time zone 'utc')::date, 1)
  on conflict (profile_id, day) do update set views = daily_page_views.views + 1;
end $$;

-- Records a click and returns the destination URL (NULL if the item isn't live).
create or replace function public.record_item_click(p_item_id uuid)
returns text language plpgsql volatile security definer set search_path = public as $$
declare
  rec record;
begin
  select i.id, i.profile_id, i.url into rec
    from page_items i join profiles p on p.id = i.profile_id
   where i.id = p_item_id and i.is_visible and p.is_published and not p.is_suspended;
  if rec.id is null then return null; end if;
  insert into daily_item_clicks (item_id, profile_id, day, clicks)
  values (rec.id, rec.profile_id, (now() at time zone 'utc')::date, 1)
  on conflict (item_id, day) do update set clicks = daily_item_clicks.clicks + 1;
  return rec.url;
end $$;

create or replace function public.submit_page_report(p_username text, p_reason text, p_details text)
returns boolean language plpgsql volatile security definer set search_path = public as $$
declare
  pid uuid;
begin
  select id into pid from profiles where username = lower(btrim(p_username));
  if pid is null then return false; end if;
  -- Crude flood guard: max 20 open reports per page per day.
  if (select count(*) from page_reports where profile_id = pid
      and created_at > now() - interval '1 day') >= 20 then
    return true;
  end if;
  insert into page_reports (profile_id, reason, details)
  values (pid, p_reason, left(coalesce(p_details, ''), 1000));
  return true;
end $$;

grant execute on function public.username_status(text)                  to anon, authenticated;
grant execute on function public.get_public_page(text)                  to anon, authenticated;
grant execute on function public.record_page_view(text)                 to anon, authenticated;
grant execute on function public.record_item_click(uuid)                to anon, authenticated;
grant execute on function public.submit_page_report(text, text, text)   to anon, authenticated;
