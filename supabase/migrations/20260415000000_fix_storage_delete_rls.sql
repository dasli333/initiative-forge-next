-- ====================
-- Fix storage DELETE RLS policies for entity image buckets
-- ====================
-- Previous policies compared auth.uid() to the first folder segment of the
-- object name, but uploads use campaignId as the first segment (see
-- src/lib/api/storage.ts). As a result, storage.remove() silently matched
-- zero rows and delete calls from the UI were effectively no-ops, orphaning
-- every "deleted" image in storage forever.
--
-- New policies authorize delete when the authenticated user owns the
-- campaign whose id equals the first folder segment.

-- --------------------
-- pc-images
-- --------------------
drop policy if exists "Users can delete their own pc images" on storage.objects;

create policy "Users can delete pc images in their campaigns"
  on storage.objects for delete
  using (
    bucket_id = 'pc-images'
    and auth.role() = 'authenticated'
    and exists (
      select 1
      from campaigns
      where campaigns.id::text = (storage.foldername(name))[1]
        and campaigns.user_id = auth.uid()
    )
  );

-- --------------------
-- location-images
-- --------------------
drop policy if exists "Users can delete their own location images" on storage.objects;

create policy "Users can delete location images in their campaigns"
  on storage.objects for delete
  using (
    bucket_id = 'location-images'
    and auth.role() = 'authenticated'
    and exists (
      select 1
      from campaigns
      where campaigns.id::text = (storage.foldername(name))[1]
        and campaigns.user_id = auth.uid()
    )
  );

-- --------------------
-- npc-images
-- --------------------
drop policy if exists "Users can delete their own npc images" on storage.objects;

create policy "Users can delete npc images in their campaigns"
  on storage.objects for delete
  using (
    bucket_id = 'npc-images'
    and auth.role() = 'authenticated'
    and exists (
      select 1
      from campaigns
      where campaigns.id::text = (storage.foldername(name))[1]
        and campaigns.user_id = auth.uid()
    )
  );

-- --------------------
-- story-item-images
-- --------------------
drop policy if exists "Users can delete their own story item images" on storage.objects;

create policy "Users can delete story item images in their campaigns"
  on storage.objects for delete
  using (
    bucket_id = 'story-item-images'
    and auth.role() = 'authenticated'
    and exists (
      select 1
      from campaigns
      where campaigns.id::text = (storage.foldername(name))[1]
        and campaigns.user_id = auth.uid()
    )
  );

-- --------------------
-- faction-images
-- --------------------
drop policy if exists "Users can delete their own faction images" on storage.objects;

create policy "Users can delete faction images in their campaigns"
  on storage.objects for delete
  using (
    bucket_id = 'faction-images'
    and auth.role() = 'authenticated'
    and exists (
      select 1
      from campaigns
      where campaigns.id::text = (storage.foldername(name))[1]
        and campaigns.user_id = auth.uid()
    )
  );
