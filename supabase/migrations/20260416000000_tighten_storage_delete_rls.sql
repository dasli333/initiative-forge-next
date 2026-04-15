-- ====================
-- Tighten storage DELETE RLS policies for entity image buckets
-- ====================
-- Previous fix (20260415) still silently denied deletes in practice. Rewrite
-- using Supabase-recommended pattern:
--   * restrict policy via `to authenticated` role clause (drop `auth.role()` check)
--   * wrap `auth.uid()` in `(select ...)` for initplan caching
-- This also makes policy intent explicit at the role level.

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
      where campaigns.id::text = (storage.foldername(name))[1]
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
      where campaigns.id::text = (storage.foldername(name))[1]
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
      where campaigns.id::text = (storage.foldername(name))[1]
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
      where campaigns.id::text = (storage.foldername(name))[1]
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
      where campaigns.id::text = (storage.foldername(name))[1]
        and campaigns.user_id = (select auth.uid())
    )
  );
