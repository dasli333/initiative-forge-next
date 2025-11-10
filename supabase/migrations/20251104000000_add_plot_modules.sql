-- migration: add_plot_modules.sql
-- purpose: add world building system (plot modules) to initiative forge
-- tables affected: locations, npcs, npc_combat_stats, quests, story_arcs, factions,
--                  lore_notes, story_items, timeline_events, sessions, entity_mentions,
--                  npc_relationships, faction_relationships, quest_entities
-- notes: implements full rls policies, creates indexes for performance, hierarchical structures

-- ====================
-- 1. create locations table
-- ====================
-- hierarchical location system for world building
-- supports parent-child relationships for continent/region/city/building hierarchy

create table locations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  name text not null,
  location_type text not null,
  description_json jsonb,
  parent_location_id uuid references locations(id) on delete set null,
  image_url text,
  coordinates_json jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table locations enable row level security;

create index idx_locations_campaign_id on locations(campaign_id);
create index idx_locations_parent_id on locations(parent_location_id);
create index idx_locations_description_gin on locations using gin(description_json);

-- ====================
-- 2. create factions table
-- ====================
-- organizations and groups in the campaign world

create table factions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  name text not null,
  description_json jsonb,
  goals_json jsonb,
  resources_json jsonb,
  image_url text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table factions enable row level security;

create index idx_factions_campaign_id on factions(campaign_id);

-- ====================
-- 3. create npcs table
-- ====================
-- non-player characters with dual-tab design (story + optional combat stats)

create table npcs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  name text not null,
  role text,
  biography_json jsonb,
  personality_json jsonb,
  image_url text,
  faction_id uuid references factions(id) on delete set null,
  current_location_id uuid references locations(id) on delete set null,
  status text not null default 'alive',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table npcs enable row level security;

create index idx_npcs_campaign_id on npcs(campaign_id);
create index idx_npcs_faction_id on npcs(faction_id);
create index idx_npcs_location_id on npcs(current_location_id);
create index idx_npcs_biography_gin on npcs using gin(biography_json);

-- ====================
-- 4. create npc_combat_stats table
-- ====================
-- optional combat statistics for npcs (1:1 relationship)

create table npc_combat_stats (
  npc_id uuid primary key references npcs(id) on delete cascade,
  hp_max smallint not null,
  armor_class smallint not null,
  speed smallint not null,
  strength smallint not null,
  dexterity smallint not null,
  constitution smallint not null,
  intelligence smallint not null,
  wisdom smallint not null,
  charisma smallint not null,
  actions_json jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table npc_combat_stats enable row level security;

-- ====================
-- 5. create story_arcs table
-- ====================
-- story arcs/plot threads in campaigns

create table story_arcs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  title text not null,
  description_json jsonb,
  status text not null default 'planning',
  start_date text,
  end_date text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table story_arcs enable row level security;

create index idx_story_arcs_campaign_id on story_arcs(campaign_id);
create index idx_story_arcs_status on story_arcs(status);

-- ====================
-- 6. create quests table
-- ====================
-- quests/missions within campaigns

create table quests (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  story_arc_id uuid references story_arcs(id) on delete set null,
  title text not null,
  description_json jsonb,
  objectives_json jsonb,
  rewards_json jsonb,
  status text not null default 'not_started',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table quests enable row level security;

create index idx_quests_campaign_id on quests(campaign_id);
create index idx_quests_arc_id on quests(story_arc_id);
create index idx_quests_status on quests(status);
create index idx_quests_description_gin on quests using gin(description_json);

-- ====================
-- 7. create lore_notes table
-- ====================
-- lore and world-building notes

create table lore_notes (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  title text not null,
  content_json jsonb,
  category text not null,
  tags text[],
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table lore_notes enable row level security;

create index idx_lore_notes_campaign_id on lore_notes(campaign_id);
create index idx_lore_notes_category on lore_notes(category);
create index idx_lore_notes_content_gin on lore_notes using gin(content_json);
create index idx_lore_notes_tags_gin on lore_notes using gin(tags);

-- ====================
-- 8. create story_items table
-- ====================
-- story-relevant items (not combat equipment)

create table story_items (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  name text not null,
  description_json jsonb,
  image_url text,
  current_owner_type text,
  current_owner_id uuid,
  ownership_history_json jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table story_items enable row level security;

create index idx_story_items_campaign_id on story_items(campaign_id);
create index idx_story_items_owner on story_items(current_owner_type, current_owner_id);

-- ====================
-- 9. create timeline_events table
-- ====================
-- timeline of events in the campaign

create table timeline_events (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  title text not null,
  description_json jsonb,
  event_date text not null,
  real_date date,
  related_entities_json jsonb,
  source_type text,
  source_id uuid,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table timeline_events enable row level security;

create index idx_timeline_events_campaign_id on timeline_events(campaign_id);
create index idx_timeline_events_date on timeline_events(event_date);

-- ====================
-- 10. create sessions table
-- ====================
-- session prep and journal

create table sessions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  session_number integer not null,
  session_date date not null,
  in_game_date text,
  title text,
  plan_json jsonb,
  log_json jsonb,
  status text not null default 'draft',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  unique (campaign_id, session_number)
);

alter table sessions enable row level security;

create index idx_sessions_campaign_id on sessions(campaign_id);
create index idx_sessions_number on sessions(session_number);
create index idx_sessions_status on sessions(status);
create index idx_sessions_plan_gin on sessions using gin(plan_json);
create index idx_sessions_log_gin on sessions using gin(log_json);

-- ====================
-- 11. create entity_mentions table
-- ====================
-- track @mentions between entities for backlinks

create table entity_mentions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  source_type text not null,
  source_id uuid not null,
  source_field text not null,
  mentioned_type text not null,
  mentioned_id uuid not null,
  created_at timestamp with time zone not null default now()
);

alter table entity_mentions enable row level security;

create index idx_entity_mentions_source on entity_mentions(source_type, source_id);
create index idx_entity_mentions_mentioned on entity_mentions(mentioned_type, mentioned_id);
create index idx_entity_mentions_campaign_id on entity_mentions(campaign_id);

-- ====================
-- 12. create npc_relationships table
-- ====================
-- relationships between npcs

create table npc_relationships (
  id uuid primary key default gen_random_uuid(),
  npc_id_1 uuid not null references npcs(id) on delete cascade,
  npc_id_2 uuid not null references npcs(id) on delete cascade,
  relationship_type text not null,
  description text,
  strength smallint default 50,
  created_at timestamp with time zone not null default now(),

  constraint npc_relationships_not_self check (npc_id_1 != npc_id_2)
);

alter table npc_relationships enable row level security;

-- ====================
-- 13. create faction_relationships table
-- ====================
-- relationships between factions

create table faction_relationships (
  id uuid primary key default gen_random_uuid(),
  faction_id_1 uuid not null references factions(id) on delete cascade,
  faction_id_2 uuid not null references factions(id) on delete cascade,
  relationship_type text not null,
  description text,
  created_at timestamp with time zone not null default now(),

  constraint faction_relationships_not_self check (faction_id_1 != faction_id_2)
);

alter table faction_relationships enable row level security;

-- ====================
-- 14. create quest_entities table
-- ====================
-- many-to-many relationship between quests and entities

create table quest_entities (
  quest_id uuid not null references quests(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  role text,

  primary key (quest_id, entity_type, entity_id)
);

alter table quest_entities enable row level security;

-- ====================
-- 15. rls policies for locations
-- ====================

create policy "users can view locations from own campaigns - anon" on locations
  for select
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = locations.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can view locations from own campaigns - authenticated" on locations
  for select
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = locations.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create locations in own campaigns - anon" on locations
  for insert
  to anon
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create locations in own campaigns - authenticated" on locations
  for insert
  to authenticated
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update locations from own campaigns - anon" on locations
  for update
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = locations.campaign_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update locations from own campaigns - authenticated" on locations
  for update
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = locations.campaign_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete locations from own campaigns - anon" on locations
  for delete
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = locations.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete locations from own campaigns - authenticated" on locations
  for delete
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = locations.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- ====================
-- 16. rls policies for factions
-- ====================

create policy "users can view factions from own campaigns - anon" on factions
  for select
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = factions.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can view factions from own campaigns - authenticated" on factions
  for select
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = factions.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create factions in own campaigns - anon" on factions
  for insert
  to anon
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create factions in own campaigns - authenticated" on factions
  for insert
  to authenticated
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update factions from own campaigns - anon" on factions
  for update
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = factions.campaign_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update factions from own campaigns - authenticated" on factions
  for update
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = factions.campaign_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete factions from own campaigns - anon" on factions
  for delete
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = factions.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete factions from own campaigns - authenticated" on factions
  for delete
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = factions.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- ====================
-- 17. rls policies for npcs
-- ====================

create policy "users can view npcs from own campaigns - anon" on npcs
  for select
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = npcs.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can view npcs from own campaigns - authenticated" on npcs
  for select
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = npcs.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create npcs in own campaigns - anon" on npcs
  for insert
  to anon
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create npcs in own campaigns - authenticated" on npcs
  for insert
  to authenticated
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update npcs from own campaigns - anon" on npcs
  for update
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = npcs.campaign_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update npcs from own campaigns - authenticated" on npcs
  for update
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = npcs.campaign_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete npcs from own campaigns - anon" on npcs
  for delete
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = npcs.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete npcs from own campaigns - authenticated" on npcs
  for delete
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = npcs.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- ====================
-- 18. rls policies for npc_combat_stats
-- ====================

create policy "users can view npc combat stats from own campaigns - anon" on npc_combat_stats
  for select
  to anon
  using (
    exists (
      select 1 from npcs
      join campaigns on campaigns.id = npcs.campaign_id
      where npcs.id = npc_combat_stats.npc_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can view npc combat stats from own campaigns - authenticated" on npc_combat_stats
  for select
  to authenticated
  using (
    exists (
      select 1 from npcs
      join campaigns on campaigns.id = npcs.campaign_id
      where npcs.id = npc_combat_stats.npc_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create npc combat stats in own campaigns - anon" on npc_combat_stats
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

create policy "users can create npc combat stats in own campaigns - authenticated" on npc_combat_stats
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

create policy "users can update npc combat stats from own campaigns - anon" on npc_combat_stats
  for update
  to anon
  using (
    exists (
      select 1 from npcs
      join campaigns on campaigns.id = npcs.campaign_id
      where npcs.id = npc_combat_stats.npc_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from npcs
      join campaigns on campaigns.id = npcs.campaign_id
      where npcs.id = npc_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update npc combat stats from own campaigns - authenticated" on npc_combat_stats
  for update
  to authenticated
  using (
    exists (
      select 1 from npcs
      join campaigns on campaigns.id = npcs.campaign_id
      where npcs.id = npc_combat_stats.npc_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from npcs
      join campaigns on campaigns.id = npcs.campaign_id
      where npcs.id = npc_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete npc combat stats from own campaigns - anon" on npc_combat_stats
  for delete
  to anon
  using (
    exists (
      select 1 from npcs
      join campaigns on campaigns.id = npcs.campaign_id
      where npcs.id = npc_combat_stats.npc_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete npc combat stats from own campaigns - authenticated" on npc_combat_stats
  for delete
  to authenticated
  using (
    exists (
      select 1 from npcs
      join campaigns on campaigns.id = npcs.campaign_id
      where npcs.id = npc_combat_stats.npc_id
      and campaigns.user_id = auth.uid()
    )
  );

-- ====================
-- 19. rls policies for story_arcs
-- ====================

create policy "users can view story arcs from own campaigns - anon" on story_arcs
  for select
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = story_arcs.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can view story arcs from own campaigns - authenticated" on story_arcs
  for select
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = story_arcs.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create story arcs in own campaigns - anon" on story_arcs
  for insert
  to anon
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create story arcs in own campaigns - authenticated" on story_arcs
  for insert
  to authenticated
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update story arcs from own campaigns - anon" on story_arcs
  for update
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = story_arcs.campaign_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update story arcs from own campaigns - authenticated" on story_arcs
  for update
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = story_arcs.campaign_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete story arcs from own campaigns - anon" on story_arcs
  for delete
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = story_arcs.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete story arcs from own campaigns - authenticated" on story_arcs
  for delete
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = story_arcs.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- ====================
-- 20. rls policies for quests
-- ====================

create policy "users can view quests from own campaigns - anon" on quests
  for select
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = quests.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can view quests from own campaigns - authenticated" on quests
  for select
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = quests.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create quests in own campaigns - anon" on quests
  for insert
  to anon
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create quests in own campaigns - authenticated" on quests
  for insert
  to authenticated
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update quests from own campaigns - anon" on quests
  for update
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = quests.campaign_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update quests from own campaigns - authenticated" on quests
  for update
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = quests.campaign_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete quests from own campaigns - anon" on quests
  for delete
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = quests.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete quests from own campaigns - authenticated" on quests
  for delete
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = quests.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- ====================
-- 21. rls policies for lore_notes
-- ====================

create policy "users can view lore notes from own campaigns - anon" on lore_notes
  for select
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = lore_notes.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can view lore notes from own campaigns - authenticated" on lore_notes
  for select
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = lore_notes.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create lore notes in own campaigns - anon" on lore_notes
  for insert
  to anon
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create lore notes in own campaigns - authenticated" on lore_notes
  for insert
  to authenticated
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update lore notes from own campaigns - anon" on lore_notes
  for update
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = lore_notes.campaign_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update lore notes from own campaigns - authenticated" on lore_notes
  for update
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = lore_notes.campaign_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete lore notes from own campaigns - anon" on lore_notes
  for delete
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = lore_notes.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete lore notes from own campaigns - authenticated" on lore_notes
  for delete
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = lore_notes.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- ====================
-- 22. rls policies for story_items
-- ====================

create policy "users can view story items from own campaigns - anon" on story_items
  for select
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = story_items.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can view story items from own campaigns - authenticated" on story_items
  for select
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = story_items.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create story items in own campaigns - anon" on story_items
  for insert
  to anon
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create story items in own campaigns - authenticated" on story_items
  for insert
  to authenticated
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update story items from own campaigns - anon" on story_items
  for update
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = story_items.campaign_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update story items from own campaigns - authenticated" on story_items
  for update
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = story_items.campaign_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete story items from own campaigns - anon" on story_items
  for delete
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = story_items.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete story items from own campaigns - authenticated" on story_items
  for delete
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = story_items.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- ====================
-- 23. rls policies for timeline_events
-- ====================

create policy "users can view timeline events from own campaigns - anon" on timeline_events
  for select
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = timeline_events.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can view timeline events from own campaigns - authenticated" on timeline_events
  for select
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = timeline_events.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create timeline events in own campaigns - anon" on timeline_events
  for insert
  to anon
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create timeline events in own campaigns - authenticated" on timeline_events
  for insert
  to authenticated
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update timeline events from own campaigns - anon" on timeline_events
  for update
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = timeline_events.campaign_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update timeline events from own campaigns - authenticated" on timeline_events
  for update
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = timeline_events.campaign_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete timeline events from own campaigns - anon" on timeline_events
  for delete
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = timeline_events.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete timeline events from own campaigns - authenticated" on timeline_events
  for delete
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = timeline_events.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- ====================
-- 24. rls policies for sessions
-- ====================

create policy "users can view sessions from own campaigns - anon" on sessions
  for select
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = sessions.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can view sessions from own campaigns - authenticated" on sessions
  for select
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = sessions.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create sessions in own campaigns - anon" on sessions
  for insert
  to anon
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create sessions in own campaigns - authenticated" on sessions
  for insert
  to authenticated
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update sessions from own campaigns - anon" on sessions
  for update
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = sessions.campaign_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update sessions from own campaigns - authenticated" on sessions
  for update
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = sessions.campaign_id
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete sessions from own campaigns - anon" on sessions
  for delete
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = sessions.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete sessions from own campaigns - authenticated" on sessions
  for delete
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = sessions.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- ====================
-- 25. rls policies for entity_mentions
-- ====================

create policy "users can view entity mentions from own campaigns - anon" on entity_mentions
  for select
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = entity_mentions.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can view entity mentions from own campaigns - authenticated" on entity_mentions
  for select
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = entity_mentions.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create entity mentions in own campaigns - anon" on entity_mentions
  for insert
  to anon
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create entity mentions in own campaigns - authenticated" on entity_mentions
  for insert
  to authenticated
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete entity mentions from own campaigns - anon" on entity_mentions
  for delete
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = entity_mentions.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete entity mentions from own campaigns - authenticated" on entity_mentions
  for delete
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = entity_mentions.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- ====================
-- 26. rls policies for npc_relationships
-- ====================

create policy "users can view npc relationships from own campaigns - anon" on npc_relationships
  for select
  to anon
  using (
    exists (
      select 1 from npcs
      join campaigns on campaigns.id = npcs.campaign_id
      where npcs.id = npc_relationships.npc_id_1
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can view npc relationships from own campaigns - authenticated" on npc_relationships
  for select
  to authenticated
  using (
    exists (
      select 1 from npcs
      join campaigns on campaigns.id = npcs.campaign_id
      where npcs.id = npc_relationships.npc_id_1
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create npc relationships in own campaigns - anon" on npc_relationships
  for insert
  to anon
  with check (
    exists (
      select 1 from npcs
      join campaigns on campaigns.id = npcs.campaign_id
      where npcs.id = npc_id_1
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create npc relationships in own campaigns - authenticated" on npc_relationships
  for insert
  to authenticated
  with check (
    exists (
      select 1 from npcs
      join campaigns on campaigns.id = npcs.campaign_id
      where npcs.id = npc_id_1
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update npc relationships from own campaigns - anon" on npc_relationships
  for update
  to anon
  using (
    exists (
      select 1 from npcs
      join campaigns on campaigns.id = npcs.campaign_id
      where npcs.id = npc_relationships.npc_id_1
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from npcs
      join campaigns on campaigns.id = npcs.campaign_id
      where npcs.id = npc_id_1
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update npc relationships from own campaigns - authenticated" on npc_relationships
  for update
  to authenticated
  using (
    exists (
      select 1 from npcs
      join campaigns on campaigns.id = npcs.campaign_id
      where npcs.id = npc_relationships.npc_id_1
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from npcs
      join campaigns on campaigns.id = npcs.campaign_id
      where npcs.id = npc_id_1
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete npc relationships from own campaigns - anon" on npc_relationships
  for delete
  to anon
  using (
    exists (
      select 1 from npcs
      join campaigns on campaigns.id = npcs.campaign_id
      where npcs.id = npc_relationships.npc_id_1
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete npc relationships from own campaigns - authenticated" on npc_relationships
  for delete
  to authenticated
  using (
    exists (
      select 1 from npcs
      join campaigns on campaigns.id = npcs.campaign_id
      where npcs.id = npc_relationships.npc_id_1
      and campaigns.user_id = auth.uid()
    )
  );

-- ====================
-- 27. rls policies for faction_relationships
-- ====================

create policy "users can view faction relationships from own campaigns - anon" on faction_relationships
  for select
  to anon
  using (
    exists (
      select 1 from factions
      join campaigns on campaigns.id = factions.campaign_id
      where factions.id = faction_relationships.faction_id_1
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can view faction relationships from own campaigns - authenticated" on faction_relationships
  for select
  to authenticated
  using (
    exists (
      select 1 from factions
      join campaigns on campaigns.id = factions.campaign_id
      where factions.id = faction_relationships.faction_id_1
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create faction relationships in own campaigns - anon" on faction_relationships
  for insert
  to anon
  with check (
    exists (
      select 1 from factions
      join campaigns on campaigns.id = factions.campaign_id
      where factions.id = faction_id_1
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create faction relationships in own campaigns - authenticated" on faction_relationships
  for insert
  to authenticated
  with check (
    exists (
      select 1 from factions
      join campaigns on campaigns.id = factions.campaign_id
      where factions.id = faction_id_1
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update faction relationships from own campaigns - anon" on faction_relationships
  for update
  to anon
  using (
    exists (
      select 1 from factions
      join campaigns on campaigns.id = factions.campaign_id
      where factions.id = faction_relationships.faction_id_1
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from factions
      join campaigns on campaigns.id = factions.campaign_id
      where factions.id = faction_id_1
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can update faction relationships from own campaigns - authenticated" on faction_relationships
  for update
  to authenticated
  using (
    exists (
      select 1 from factions
      join campaigns on campaigns.id = factions.campaign_id
      where factions.id = faction_relationships.faction_id_1
      and campaigns.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from factions
      join campaigns on campaigns.id = factions.campaign_id
      where factions.id = faction_id_1
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete faction relationships from own campaigns - anon" on faction_relationships
  for delete
  to anon
  using (
    exists (
      select 1 from factions
      join campaigns on campaigns.id = factions.campaign_id
      where factions.id = faction_relationships.faction_id_1
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete faction relationships from own campaigns - authenticated" on faction_relationships
  for delete
  to authenticated
  using (
    exists (
      select 1 from factions
      join campaigns on campaigns.id = factions.campaign_id
      where factions.id = faction_relationships.faction_id_1
      and campaigns.user_id = auth.uid()
    )
  );

-- ====================
-- 28. rls policies for quest_entities
-- ====================

create policy "users can view quest entities from own campaigns - anon" on quest_entities
  for select
  to anon
  using (
    exists (
      select 1 from quests
      join campaigns on campaigns.id = quests.campaign_id
      where quests.id = quest_entities.quest_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can view quest entities from own campaigns - authenticated" on quest_entities
  for select
  to authenticated
  using (
    exists (
      select 1 from quests
      join campaigns on campaigns.id = quests.campaign_id
      where quests.id = quest_entities.quest_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create quest entities in own campaigns - anon" on quest_entities
  for insert
  to anon
  with check (
    exists (
      select 1 from quests
      join campaigns on campaigns.id = quests.campaign_id
      where quests.id = quest_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create quest entities in own campaigns - authenticated" on quest_entities
  for insert
  to authenticated
  with check (
    exists (
      select 1 from quests
      join campaigns on campaigns.id = quests.campaign_id
      where quests.id = quest_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete quest entities from own campaigns - anon" on quest_entities
  for delete
  to anon
  using (
    exists (
      select 1 from quests
      join campaigns on campaigns.id = quests.campaign_id
      where quests.id = quest_entities.quest_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete quest entities from own campaigns - authenticated" on quest_entities
  for delete
  to authenticated
  using (
    exists (
      select 1 from quests
      join campaigns on campaigns.id = quests.campaign_id
      where quests.id = quest_entities.quest_id
      and campaigns.user_id = auth.uid()
    )
  );
