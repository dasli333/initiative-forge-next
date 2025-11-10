-- ====================
-- Create storage buckets for entity images
-- ====================
-- Storage buckets for location, npc, story item, and faction images
-- All follow same pattern as pc-images bucket (public, 5MB limit, RLS)

-- create storage bucket for location images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'location-images',
  'location-images',
  true,
  5242880, -- 5 MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- create storage bucket for npc images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'npc-images',
  'npc-images',
  true,
  5242880, -- 5 MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- create storage bucket for story item images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'story-item-images',
  'story-item-images',
  true,
  5242880, -- 5 MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- create storage bucket for faction images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'faction-images',
  'faction-images',
  true,
  5242880, -- 5 MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- ====================
-- RLS policies for location-images
-- ====================

create policy "Authenticated users can view location images"
  on storage.objects for select
  using (bucket_id = 'location-images' and auth.role() = 'authenticated');

create policy "Authenticated users can upload location images"
  on storage.objects for insert
  with check (bucket_id = 'location-images' and auth.role() = 'authenticated');

create policy "Users can delete their own location images"
  on storage.objects for delete
  using (
    bucket_id = 'location-images'
    and auth.role() = 'authenticated'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ====================
-- RLS policies for npc-images
-- ====================

create policy "Authenticated users can view npc images"
  on storage.objects for select
  using (bucket_id = 'npc-images' and auth.role() = 'authenticated');

create policy "Authenticated users can upload npc images"
  on storage.objects for insert
  with check (bucket_id = 'npc-images' and auth.role() = 'authenticated');

create policy "Users can delete their own npc images"
  on storage.objects for delete
  using (
    bucket_id = 'npc-images'
    and auth.role() = 'authenticated'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ====================
-- RLS policies for story-item-images
-- ====================

create policy "Authenticated users can view story item images"
  on storage.objects for select
  using (bucket_id = 'story-item-images' and auth.role() = 'authenticated');

create policy "Authenticated users can upload story item images"
  on storage.objects for insert
  with check (bucket_id = 'story-item-images' and auth.role() = 'authenticated');

create policy "Users can delete their own story item images"
  on storage.objects for delete
  using (
    bucket_id = 'story-item-images'
    and auth.role() = 'authenticated'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ====================
-- RLS policies for faction-images
-- ====================

create policy "Authenticated users can view faction images"
  on storage.objects for select
  using (bucket_id = 'faction-images' and auth.role() = 'authenticated');

create policy "Authenticated users can upload faction images"
  on storage.objects for insert
  with check (bucket_id = 'faction-images' and auth.role() = 'authenticated');

create policy "Users can delete their own faction images"
  on storage.objects for delete
  using (
    bucket_id = 'faction-images'
    and auth.role() = 'authenticated'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
