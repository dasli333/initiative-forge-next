-- ====================
-- Fix ambiguous `name` column reference in storage DELETE policies
-- ====================
-- Previous migration (20260416) referenced `name` inside `exists (select 1
-- from campaigns ...)`. Postgres bound `name` to `campaigns.name` (the
-- campaign title) instead of `storage.objects.name` (the object path),
-- so `storage.foldername(name)` parsed the campaign name and never matched
-- the campaign id. Every delete silently denied.
--
-- Fix: qualify as `storage.objects.name`.

-- --------------------
-- pc-images
-- --------------------
drop policy if exists "Users can delete pc images in their campaigns" on storage.objects;

create policy "Users can delete pc images in their campaigns"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'pc-images'
    and exists (
      select 1
      from campaigns
      where campaigns.id::text = (storage.foldername(storage.objects.name))[1]
        and campaigns.user_id = (select auth.uid())
    )
  );

-- --------------------
-- location-images
-- --------------------
drop policy if exists "Users can delete location images in their campaigns" on storage.objects;

create policy "Users can delete location images in their campaigns"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'location-images'
    and exists (
      select 1
      from campaigns
      where campaigns.id::text = (storage.foldername(storage.objects.name))[1]
        and campaigns.user_id = (select auth.uid())
    )
  );

-- --------------------
-- npc-images
-- --------------------
drop policy if exists "Users can delete npc images in their campaigns" on storage.objects;

create policy "Users can delete npc images in their campaigns"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'npc-images'
    and exists (
      select 1
      from campaigns
      where campaigns.id::text = (storage.foldername(storage.objects.name))[1]
        and campaigns.user_id = (select auth.uid())
    )
  );

-- --------------------
-- story-item-images
-- --------------------
drop policy if exists "Users can delete story item images in their campaigns" on storage.objects;

create policy "Users can delete story item images in their campaigns"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'story-item-images'
    and exists (
      select 1
      from campaigns
      where campaigns.id::text = (storage.foldername(storage.objects.name))[1]
        and campaigns.user_id = (select auth.uid())
    )
  );

-- --------------------
-- faction-images
-- --------------------
drop policy if exists "Users can delete faction images in their campaigns" on storage.objects;

create policy "Users can delete faction images in their campaigns"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'faction-images'
    and exists (
      select 1
      from campaigns
      where campaigns.id::text = (storage.foldername(storage.objects.name))[1]
        and campaigns.user_id = (select auth.uid())
    )
  );
