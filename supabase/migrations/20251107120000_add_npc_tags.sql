-- migration: add_npc_tags.sql
-- purpose: add tag system for npcs (reusable tags per campaign with visual attributes)
-- tables affected: npc_tags, npc_tag_assignments
-- notes: implements many-to-many relationship between npcs and tags
--        tags are reusable within campaign with customizable colors and icons

-- ====================
-- 1. create npc_tags table
-- ====================
-- reusable tags for categorizing npcs (ally, enemy, important, quest giver, etc.)
-- each tag belongs to one campaign and has visual attributes (color, icon)

create table npc_tags (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  name text not null,
  color text not null, -- hex color or tailwind color name (e.g., 'emerald', 'red', 'amber')
  icon text not null, -- lucide-react icon name (e.g., 'Sword', 'Heart', 'Star')
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- enable row level security for npc_tags
alter table npc_tags enable row level security;

-- create index for faster lookups by campaign_id
create index idx_npc_tags_campaign_id on npc_tags(campaign_id);

-- ensure tag names are unique within campaign (case-insensitive)
create unique index idx_npc_tags_campaign_name_unique on npc_tags(campaign_id, lower(name));

-- ====================
-- 2. create npc_tag_assignments table
-- ====================
-- pivot table for many-to-many relationship between npcs and tags
-- allows one npc to have multiple tags and one tag to be assigned to multiple npcs

create table npc_tag_assignments (
  id uuid primary key default gen_random_uuid(),
  npc_id uuid not null references npcs(id) on delete cascade,
  tag_id uuid not null references npc_tags(id) on delete cascade,
  created_at timestamp with time zone not null default now(),

  -- ensure one tag can only be assigned once to same npc
  unique (npc_id, tag_id)
);

-- enable row level security for npc_tag_assignments
alter table npc_tag_assignments enable row level security;

-- create indexes for faster joins and queries
create index idx_npc_tag_assignments_npc_id on npc_tag_assignments(npc_id);
create index idx_npc_tag_assignments_tag_id on npc_tag_assignments(tag_id);

-- ====================
-- 3. rls policies for npc_tags
-- ====================

-- select policy: users can view tags from own campaigns
create policy "users can view tags from own campaigns - anon" on npc_tags
  for select
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = npc_tags.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can view tags from own campaigns - authenticated" on npc_tags
  for select
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = npc_tags.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- insert policy: users can create tags in own campaigns
create policy "users can create tags in own campaigns - anon" on npc_tags
  for insert
  to anon
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create tags in own campaigns - authenticated" on npc_tags
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
create policy "users can update tags in own campaigns - anon" on npc_tags
  for update
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = npc_tags.campaign_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = npc_tags.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update tags in own campaigns - authenticated" on npc_tags
  for update
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = npc_tags.campaign_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = npc_tags.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- delete policy: users can delete tags from own campaigns
create policy "users can delete tags from own campaigns - anon" on npc_tags
  for delete
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = npc_tags.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete tags from own campaigns - authenticated" on npc_tags
  for delete
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = npc_tags.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- ====================
-- 4. rls policies for npc_tag_assignments
-- ====================

-- select policy: users can view tag assignments for npcs in own campaigns
create policy "users can view tag assignments from own campaigns - anon" on npc_tag_assignments
  for select
  to anon
  using (
    exists (
      select 1 from npcs
      join campaigns on campaigns.id = npcs.campaign_id
      where npcs.id = npc_tag_assignments.npc_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can view tag assignments from own campaigns - authenticated" on npc_tag_assignments
  for select
  to authenticated
  using (
    exists (
      select 1 from npcs
      join campaigns on campaigns.id = npcs.campaign_id
      where npcs.id = npc_tag_assignments.npc_id
      and campaigns.user_id = auth.uid()
    )
  );

-- insert policy: users can create tag assignments for npcs in own campaigns
create policy "users can create tag assignments in own campaigns - anon" on npc_tag_assignments
  for insert
  to anon
  with check (
    exists (
      select 1 from npcs
      join campaigns on campaigns.id = npcs.campaign_id
      where npcs.id = npc_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create tag assignments in own campaigns - authenticated" on npc_tag_assignments
  for insert
  to authenticated
  with check (
    exists (
      select 1 from npcs
      join campaigns on campaigns.id = npcs.campaign_id
      where npcs.id = npc_id
      and campaigns.user_id = auth.uid()
    )
  );

-- delete policy: users can delete tag assignments for npcs in own campaigns
create policy "users can delete tag assignments from own campaigns - anon" on npc_tag_assignments
  for delete
  to anon
  using (
    exists (
      select 1 from npcs
      join campaigns on campaigns.id = npcs.campaign_id
      where npcs.id = npc_tag_assignments.npc_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete tag assignments from own campaigns - authenticated" on npc_tag_assignments
  for delete
  to authenticated
  using (
    exists (
      select 1 from npcs
      join campaigns on campaigns.id = npcs.campaign_id
      where npcs.id = npc_tag_assignments.npc_id
      and campaigns.user_id = auth.uid()
    )
  );
