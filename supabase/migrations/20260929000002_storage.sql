-- =============================================================================
-- BizeLinks — image storage (profile photos, featured-card images)
--
-- One public bucket. Each user may only write inside a folder named after their
-- own account ID:  page-images/<user-id>/<file>
-- Limits: 2 MB per file; JPEG, PNG and WebP only. SVG is deliberately NOT
-- allowed, because SVG files can carry scripts.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('page-images', 'page-images', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "page_images_insert_own_folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'page-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "page_images_update_own_folder" on storage.objects for update to authenticated
  using (bucket_id = 'page-images' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'page-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "page_images_delete_own_folder" on storage.objects for delete to authenticated
  using (bucket_id = 'page-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Owners can list their own folder (needed to clean up old images).
create policy "page_images_select_own_folder" on storage.objects for select to authenticated
  using (bucket_id = 'page-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
