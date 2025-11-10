-- ====================
-- Create pc-images storage bucket
-- ====================
-- Storage bucket for player character portrait images
-- Follows same pattern as location-images and npc-images buckets

-- create storage bucket for player character images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pc-images',
  'pc-images',
  true,
  5242880, -- 5 MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- enable RLS for pc-images bucket
create policy "Authenticated users can view pc images"
  on storage.objects for select
  using (bucket_id = 'pc-images' and auth.role() = 'authenticated');

create policy "Authenticated users can upload pc images"
  on storage.objects for insert
  with check (bucket_id = 'pc-images' and auth.role() = 'authenticated');

create policy "Users can delete their own pc images"
  on storage.objects for delete
  using (
    bucket_id = 'pc-images'
    and auth.role() = 'authenticated'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
