-- =============================================================================
-- BizeLinks database security tests. Run with: npm run test:db
-- Every block raises an exception (and stops the run) if a rule is broken.
-- =============================================================================
\set ON_ERROR_STOP on
\set QUIET on
\pset tuples_only on
\pset format unaligned

-- Helper: assert that a statement fails.
create or replace function pg_temp.expect_error(stmt text, label text)
returns void language plpgsql as $$
begin
  begin
    execute stmt;
  exception when others then
    raise notice 'PASS  %  (blocked: %)', label, sqlerrm;
    return;
  end;
  raise exception 'FAIL  % — statement unexpectedly succeeded', label;
end $$;

create or replace function pg_temp.check(cond boolean, label text)
returns void language plpgsql as $$
begin
  if not coalesce(cond, false) then raise exception 'FAIL  %', label; end if;
  raise notice 'PASS  %', label;
end $$;

grant execute on function pg_temp.expect_error(text, text) to anon, authenticated;
grant execute on function pg_temp.check(boolean, text) to anon, authenticated;

-- Two test accounts
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'ada@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'ben@example.com');

-- ---------------------------------------------------------------- Ada signs in
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);

insert into public.profiles (id, username, display_name) values
  ('11111111-1111-1111-1111-111111111111', 'ada', 'Ada Lovelace');
select pg_temp.check(true, 'user can create own profile');

select pg_temp.expect_error(
  $$insert into public.profiles (id, username) values ('22222222-2222-2222-2222-222222222222', 'impostor')$$,
  'user cannot create a profile for another account');

select pg_temp.expect_error($$update public.profiles set username = 'admin' where id = auth.uid()$$,
  'reserved username is rejected');
select pg_temp.expect_error($$update public.profiles set username = 'Ada Caps' where id = auth.uid()$$,
  'badly formatted username is rejected');
select pg_temp.expect_error($$update public.profiles set is_suspended = true where id = auth.uid()$$,
  'user cannot touch the staff-only suspension flag');
select pg_temp.expect_error($$update public.profiles set accent = 'red; }' where id = auth.uid()$$,
  'accent colour must be a hex value');

insert into public.page_items (profile_id, zone, title, url) values
  (auth.uid(), 'spotlight', 'My new book', 'https://example.com/book'),
  (auth.uid(), 'links', 'Website', 'https://example.com');
select pg_temp.check(true, 'user can add own items');

insert into public.page_items (profile_id, zone, title, url, badge) values
  (auth.uid(), 'spotlight', 'Second', 'https://example.com/2', 'new'),
  (auth.uid(), 'spotlight', 'Third',  'https://example.com/3', null);
select pg_temp.check(true, 'spotlight holds up to 3 items');
select pg_temp.expect_error(
  $$insert into public.page_items (profile_id, zone, title, url) values (auth.uid(), 'spotlight', 'Fourth', 'https://example.com/4')$$,
  'spotlight is capped at 3');
select pg_temp.expect_error(
  $$insert into public.page_items (profile_id, zone, title, url, badge) values (auth.uid(), 'links', 'Bad badge', 'https://example.com', 'FREE MONEY')$$,
  'badges come from a fixed list');
select pg_temp.expect_error(
  $$insert into public.page_items (profile_id, zone, title, url) values (auth.uid(), 'featured', 'Old zone', 'https://example.com')$$,
  'the retired featured zone is rejected');
delete from public.page_items where profile_id = auth.uid() and zone = 'spotlight' and title in ('Second', 'Third');
select pg_temp.expect_error(
  $$insert into public.page_items (profile_id, title, url) values (auth.uid(), 'Bad', 'javascript:alert(1)')$$,
  'javascript: URLs are rejected');
select pg_temp.expect_error(
  $$insert into public.page_items (profile_id, title, url) values (auth.uid(), 'Bad', 'data:text/html,hi')$$,
  'data: URLs are rejected');
select pg_temp.expect_error(
  $$insert into public.page_items (profile_id, title, url) values (auth.uid(), '   ', 'https://example.com')$$,
  'blank titles are rejected');

insert into public.page_items (profile_id, zone, kind, title, url, price_label)
  select auth.uid(), 'products', 'product', 'Product ' || g, 'https://example.com/p' || g, '£' || g || '.99'
    from generate_series(1, 12) g;
select pg_temp.expect_error(
  $$insert into public.page_items (profile_id, zone, title, url) values (auth.uid(), 'products', 'Thirteenth', 'https://example.com/13')$$,
  'products are capped at 12');
select pg_temp.expect_error(
  $$update public.page_items set price_label = 'This price label is far too long' where profile_id = auth.uid() and zone = 'products'$$,
  'price labels are capped at 20 characters');
delete from public.page_items where profile_id = auth.uid() and zone = 'products';

-- Social profiles
insert into public.social_links (profile_id, provider, url, position) values
  (auth.uid(), 'instagram', 'https://instagram.com/ada', 0),
  (auth.uid(), 'email', 'mailto:ada@example.com', 1);
select pg_temp.check(true, 'user can add own social links');
select pg_temp.expect_error(
  $$insert into public.social_links (profile_id, provider, url) values (auth.uid(), 'instagram', 'https://instagram.com/ada2')$$,
  'one link per social platform');
select pg_temp.expect_error(
  $$insert into public.social_links (profile_id, provider, url) values (auth.uid(), 'youtube', 'javascript:alert(1)')$$,
  'social links must be web addresses');
select pg_temp.expect_error(
  $$insert into public.social_links (profile_id, provider, url) values (auth.uid(), 'website', 'mailto:ada@example.com')$$,
  'mailto is only allowed for the email platform');
select pg_temp.expect_error(
  $$insert into public.social_links (profile_id, provider, url) values (auth.uid(), 'myspace', 'https://myspace.com/ada')$$,
  'unknown social platforms are rejected');
select pg_temp.expect_error($$update public.profiles set entity_type = 'robot' where id = auth.uid()$$,
  'entity type comes from a fixed list');
update public.profiles set descriptor = 'Mathematician and writer' where id = auth.uid();

-- Direct writes to analytics are blocked
select pg_temp.expect_error(
  $$insert into public.daily_page_views (profile_id, day, views) values (auth.uid(), current_date, 99999)$$,
  'users cannot fake analytics numbers');

-- Not published yet → invisible to the public
select pg_temp.check(public.get_public_page('ada') is null, 'unpublished page is not public');
update public.profiles set is_published = true where id = auth.uid();
select pg_temp.check((select published_at is not null from public.profiles where id = auth.uid()),
  'publishing stamps published_at');

-- ---------------------------------------------------------------- Ben signs in
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);

insert into public.profiles (id, username) values ('22222222-2222-2222-2222-222222222222', 'ben');

select pg_temp.check((select count(*) = 0 from public.profiles where username = 'ada'),
  'user cannot read another user''s profile row');
select pg_temp.check((select count(*) = 0 from public.page_items where profile_id = '11111111-1111-1111-1111-111111111111'),
  'user cannot read another user''s items');
select pg_temp.check((select count(*) = 0 from public.social_links where profile_id = '11111111-1111-1111-1111-111111111111'),
  'user cannot read another user''s social links');
update public.social_links set url = 'https://evil.example' where profile_id = '11111111-1111-1111-1111-111111111111';
select pg_temp.expect_error(
  $$insert into public.social_links (profile_id, provider, url) values ('11111111-1111-1111-1111-111111111111', 'tiktok', 'https://spam.example')$$,
  'user cannot add social links to another user''s page');

update public.profiles set bio = 'hacked' where id = '11111111-1111-1111-1111-111111111111';
update public.page_items set url = 'https://evil.example' where profile_id = '11111111-1111-1111-1111-111111111111';
delete from public.page_items where profile_id = '11111111-1111-1111-1111-111111111111';

select pg_temp.expect_error(
  $$insert into public.page_items (profile_id, title, url) values ('11111111-1111-1111-1111-111111111111', 'Spam', 'https://spam.example')$$,
  'user cannot add items to another user''s page');
select pg_temp.expect_error($$update public.profiles set username = 'ada' where id = auth.uid()$$,
  'duplicate usernames are rejected');

-- ---------------------------------------------------------------- anonymous visitor
reset role;
select pg_temp.check((select bio from public.profiles where username = 'ada') = '',
  'another user''s update had no effect');
select pg_temp.check((select count(*) = 2 from public.page_items where profile_id = '11111111-1111-1111-1111-111111111111'),
  'another user''s update/delete had no effect on items');

set role anon;
select pg_temp.expect_error($$select * from public.profiles$$, 'visitors cannot read the profiles table');
select pg_temp.expect_error($$select * from public.page_items$$, 'visitors cannot read the items table');
select pg_temp.expect_error($$select * from public.page_reports$$, 'visitors cannot read reports');

select pg_temp.check((public.get_public_page('ada') ->> 'display_name') = 'Ada Lovelace', 'published page is public');
select pg_temp.check(not (public.get_public_page('ada') ? 'is_suspended'), 'private fields are not exposed');
select pg_temp.expect_error($$select * from public.social_links$$, 'visitors cannot read the social links table');
select pg_temp.check((public.get_public_page('ada') ->> 'descriptor') = 'Mathematician and writer', 'descriptor is public');
select pg_temp.check(jsonb_array_length(public.get_public_page('ada') -> 'socials') = 2, 'social links are public');
select pg_temp.check((public.get_public_page('ada') -> 'socials' -> 0 ->> 'url') = 'https://instagram.com/ada',
  'another user''s social update had no effect');
select pg_temp.check((select count(*) = 1 from public.list_indexable_pages() where username = 'ada'), 'indexable page is in the sitemap list');
select pg_temp.check((select count(*) = 0 from public.list_indexable_pages() where username = 'ben'), 'unpublished page is not in the sitemap list');
select pg_temp.check(public.username_status('example') = 'reserved', 'new route names are reserved');
select pg_temp.check(public.get_public_page('ben') is null, 'Ben''s unpublished page stays hidden');
select pg_temp.check(public.username_status('ada') = 'taken', 'username_status: taken');
select pg_temp.check(public.username_status('login') = 'reserved', 'username_status: reserved');
select pg_temp.check(public.username_status('x!') = 'invalid', 'username_status: invalid');
select pg_temp.check(public.username_status('newperson') = 'available', 'username_status: available');

select public.record_page_view('ada');
select public.record_page_view('ada');
select public.record_page_view('ben');  -- unpublished: ignored
select pg_temp.check(public.record_item_click('00000000-0000-0000-0000-000000000000') is null,
  'clicks on unknown items are ignored');
select pg_temp.check(public.submit_page_report('ada', 'spam', 'test'), 'visitors can report a page');

reset role;
select pg_temp.check((select views from public.daily_page_views
  where profile_id = '11111111-1111-1111-1111-111111111111') = 2, 'page views counted');
select pg_temp.check((select count(*) = 0 from public.daily_page_views
  where profile_id = '22222222-2222-2222-2222-222222222222'), 'views on unpublished pages ignored');

-- ---------------------------------------------------------------- username change + hold
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);
update public.profiles set username = 'ada-writes' where id = auth.uid();
select pg_temp.check(public.username_status('ada') = 'on_hold', 'released username is held for 30 days');

select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);
select pg_temp.expect_error($$update public.profiles set username = 'ada' where id = auth.uid()$$,
  'someone else cannot grab a recently released username');

-- ---------------------------------------------------------------- storage folders
insert into storage.objects (bucket_id, name) values ('page-images', '22222222-2222-2222-2222-222222222222/avatar.webp');
select pg_temp.check(true, 'user can upload into own folder');
select pg_temp.expect_error(
  $$insert into storage.objects (bucket_id, name) values ('page-images', '11111111-1111-1111-1111-111111111111/avatar.webp')$$,
  'user cannot upload into another user''s folder');

reset role;
select pg_temp.check((select 'image/svg+xml' <> all(allowed_mime_types) from storage.buckets where id = 'page-images'),
  'SVG uploads are not allowed');

\echo 'ALL DATABASE SECURITY TESTS PASSED'
