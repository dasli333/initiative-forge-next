-- migration: add_lore_note_tags.sql
-- purpose: add tag system for lore notes (reusable tags per campaign with visual attributes)
-- tables affected: lore_note_tags, lore_note_tag_assignments, lore_notes
-- notes: implements many-to-many relationship between lore notes and tags
--        tags are reusable within campaign with customizable colors and icons
--        drops old tags text[] column from lore_notes table

-- ====================
-- 1. create lore_note_tags table
-- ====================
-- reusable tags for categorizing lore notes (prophecy, ancient, secret, rumor, etc.)
-- each tag belongs to one campaign and has visual attributes (color, icon)

create table lore_note_tags (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  name text not null,
  color text not null, -- hex color or tailwind color name (e.g., 'emerald', 'red', 'amber')
  icon text not null, -- lucide-react icon name (e.g., 'Scroll', 'BookOpen', 'Sparkles')
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- enable row level security for lore_note_tags
alter table lore_note_tags enable row level security;

-- create index for faster lookups by campaign_id
create index idx_lore_note_tags_campaign_id on lore_note_tags(campaign_id);

-- ensure tag names are unique within campaign (case-insensitive)
create unique index idx_lore_note_tags_campaign_name_unique on lore_note_tags(campaign_id, lower(name));

-- ====================
-- 2. create lore_note_tag_assignments table
-- ====================
-- pivot table for many-to-many relationship between lore notes and tags
-- allows one lore note to have multiple tags and one tag to be assigned to multiple lore notes

create table lore_note_tag_assignments (
  id uuid primary key default gen_random_uuid(),
  lore_note_id uuid not null references lore_notes(id) on delete cascade,
  tag_id uuid not null references lore_note_tags(id) on delete cascade,
  created_at timestamp with time zone not null default now(),

  -- ensure one tag can only be assigned once to same lore note
  unique (lore_note_id, tag_id)
);

-- enable row level security for lore_note_tag_assignments
alter table lore_note_tag_assignments enable row level security;

-- create indexes for faster joins and queries
create index idx_lore_note_tag_assignments_lore_note_id on lore_note_tag_assignments(lore_note_id);
create index idx_lore_note_tag_assignments_tag_id on lore_note_tag_assignments(tag_id);

-- ====================
-- 3. rls policies for lore_note_tags
-- ====================

-- select policy: users can view tags from own campaigns
create policy "users can view tags from own campaigns - anon" on lore_note_tags
  for select
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = lore_note_tags.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can view tags from own campaigns - authenticated" on lore_note_tags
  for select
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = lore_note_tags.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- insert policy: users can create tags in own campaigns
create policy "users can create tags in own campaigns - anon" on lore_note_tags
  for insert
  to anon
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create tags in own campaigns - authenticated" on lore_note_tags
  for insert
  to authenticated
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- update policy: users can update tags in own campaigns
create policy "users can update tags in own campaigns - anon" on lore_note_tags
  for update
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = lore_note_tags.campaign_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = lore_note_tags.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update tags in own campaigns - authenticated" on lore_note_tags
  for update
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = lore_note_tags.campaign_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = lore_note_tags.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- delete policy: users can delete tags from own campaigns
create policy "users can delete tags from own campaigns - anon" on lore_note_tags
  for delete
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = lore_note_tags.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete tags from own campaigns - authenticated" on lore_note_tags
  for delete
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = lore_note_tags.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- ====================
-- 4. rls policies for lore_note_tag_assignments
-- ====================

-- select policy: users can view tag assignments for lore notes in own campaigns
create policy "users can view tag assignments from own campaigns - anon" on lore_note_tag_assignments
  for select
  to anon
  using (
    exists (
      select 1 from lore_notes
      join campaigns on campaigns.id = lore_notes.campaign_id
      where lore_notes.id = lore_note_tag_assignments.lore_note_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can view tag assignments from own campaigns - authenticated" on lore_note_tag_assignments
  for select
  to authenticated
  using (
    exists (
      select 1 from lore_notes
      join campaigns on campaigns.id = lore_notes.campaign_id
      where lore_notes.id = lore_note_tag_assignments.lore_note_id
      and campaigns.user_id = auth.uid()
    )
  );

-- insert policy: users can create tag assignments for lore notes in own campaigns
create policy "users can create tag assignments in own campaigns - anon" on lore_note_tag_assignments
  for insert
  to anon
  with check (
    exists (
      select 1 from lore_notes
      join campaigns on campaigns.id = lore_notes.campaign_id
      where lore_notes.id = lore_note_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create tag assignments in own campaigns - authenticated" on lore_note_tag_assignments
  for insert
  to authenticated
  with check (
    exists (
      select 1 from lore_notes
      join campaigns on campaigns.id = lore_notes.campaign_id
      where lore_notes.id = lore_note_id
      and campaigns.user_id = auth.uid()
    )
  );

-- delete policy: users can delete tag assignments for lore notes in own campaigns
create policy "users can delete tag assignments from own campaigns - anon" on lore_note_tag_assignments
  for delete
  to anon
  using (
    exists (
      select 1 from lore_notes
      join campaigns on campaigns.id = lore_notes.campaign_id
      where lore_notes.id = lore_note_tag_assignments.lore_note_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete tag assignments from own campaigns - authenticated" on lore_note_tag_assignments
  for delete
  to authenticated
  using (
    exists (
      select 1 from lore_notes
      join campaigns on campaigns.id = lore_notes.campaign_id
      where lore_notes.id = lore_note_tag_assignments.lore_note_id
      and campaigns.user_id = auth.uid()
    )
  );

-- ====================
-- 5. drop old tags column from lore_notes
-- ====================

-- drop GIN index on tags array
drop index if exists idx_lore_notes_tags_gin;

-- drop tags column (no longer needed with new tag system)
alter table lore_notes drop column if exists tags;
