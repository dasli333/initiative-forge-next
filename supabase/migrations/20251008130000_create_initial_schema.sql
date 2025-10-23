-- migration: create_initial_schema.sql
-- purpose: initialize database schema for initiative forge mvp
-- tables affected: campaigns, player_characters, monsters, spells, combats, conditions
-- notes: implements full rls policies, creates indexes for performance, sets up cascade rules
--        combat state managed via zustand with snapshot persistence in combats.state_snapshot

-- ====================
-- 1. create campaigns table
-- ====================
-- stores user's d&d campaigns (dungeon master's campaigns)
-- each user can have multiple campaigns with unique names

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- ensure campaign names are unique per user
  unique (user_id, name)
);

-- enable row level security for campaigns
alter table campaigns enable row level security;

-- create index for faster lookups by user_id
create index idx_campaigns_user_id on campaigns(user_id);

-- ====================
-- 2. create player_characters table
-- ====================
-- stores simplified player character sheets within campaigns
-- each character belongs to one campaign and has unique name within that campaign

create table player_characters (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  name text not null,
  max_hp smallint not null,
  armor_class smallint not null,
  speed smallint not null,
  strength smallint not null,
  dexterity smallint not null,
  constitution smallint not null,
  intelligence smallint not null,
  wisdom smallint not null,
  charisma smallint not null,
  -- actions stored as jsonb array of action objects
  -- format: [{"name": "Longsword Attack", "type": "melee_weapon_attack", ...}]
  actions jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- ensure character names are unique within campaign
  unique (campaign_id, name)
);

-- enable row level security for player_characters
alter table player_characters enable row level security;

-- create index for faster lookups by campaign_id
create index idx_player_characters_campaign_id on player_characters(campaign_id);

-- ====================
-- 3. create monsters table
-- ====================
-- global library of monsters (srd data)
-- monsters are shared across all users and campaigns

create table monsters (
  id uuid primary key default gen_random_uuid(),
  -- name extracted from jsonb for easier searching and indexing
  name text not null,
  -- all other monster data (cr, stats, actions, etc.) stored as jsonb
  data jsonb not null,
  created_at timestamp with time zone not null default now()
);

-- enable row level security for monsters
alter table monsters enable row level security;

-- create b-tree index for searching by name
create index idx_monsters_name on monsters(name);

-- create gin index for filtering by nested jsonb fields (e.g., challenge_rating)
create index idx_monsters_data_gin on monsters using gin(data);

-- ====================
-- 4. create spells table
-- ====================
-- global library of spells (srd data)
-- spells are shared across all users and campaigns

create table spells (
  id uuid primary key default gen_random_uuid(),
  -- name extracted from jsonb for easier searching and indexing
  name text not null,
  -- all other spell data (level, classes, description, etc.) stored as jsonb
  data jsonb not null,
  created_at timestamp with time zone not null default now()
);

-- enable row level security for spells
alter table spells enable row level security;

-- create b-tree index for searching by name
create index idx_spells_name on spells(name);

-- create gin index for filtering by nested jsonb fields (e.g., level)
create index idx_spells_data_gin on spells using gin(data);

-- ====================
-- 5. create combats table
-- ====================
-- represents individual combat encounters within campaigns
-- tracks combat state including round number and active/completed status
-- state_snapshot stores full combat state (participants, hp, initiatives, conditions)

create table combats (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  name text not null,
  -- status: 'active' or 'completed'
  status text not null default 'active',
  current_round smallint not null default 1,
  -- snapshot of combat state managed by zustand
  -- saved manually or auto-saved after each round
  -- format: { participants: [...], active_participant_index: number }
  state_snapshot jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- enable row level security for combats
alter table combats enable row level security;

-- create index for faster lookups by campaign_id
create index idx_combats_campaign_id on combats(campaign_id);

-- create gin index for searching within state_snapshot
create index idx_combats_state_snapshot_gin on combats using gin(state_snapshot);

-- ====================
-- 6. create conditions table
-- ====================
-- static reference table for d&d 5e condition definitions
-- provides localized names and descriptions for conditions (e.g., "Blinded", "Stunned")

create table conditions (
  id text primary key,  -- Using text ID from JSON data (e.g., 'blinded', 'charmed')
  name jsonb not null,  -- Localized name: { "en": "Blinded", "pl": "Oślepiony" }
  description text not null,

  -- Validate JSONB structure has required language keys
  constraint name_has_en check (name ? 'en'),
  constraint name_has_pl check (name ? 'pl')
);

-- enable row level security for conditions
alter table conditions enable row level security;

-- ====================
-- 7. rls policies for campaigns
-- ====================

-- select policy: users can only view their own campaigns
create policy "users can view own campaigns - anon" on campaigns
  for select
  to anon
  using (auth.uid() = user_id);

create policy "users can view own campaigns - authenticated" on campaigns
  for select
  to authenticated
  using (auth.uid() = user_id);

-- insert policy: users can only create campaigns for themselves
create policy "users can create own campaigns - anon" on campaigns
  for insert
  to anon
  with check (auth.uid() = user_id);

create policy "users can create own campaigns - authenticated" on campaigns
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- update policy: users can only update their own campaigns
create policy "users can update own campaigns - anon" on campaigns
  for update
  to anon
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can update own campaigns - authenticated" on campaigns
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- delete policy: users can only delete their own campaigns
-- cascade will automatically delete related player_characters, combats, and combat_participants
create policy "users can delete own campaigns - anon" on campaigns
  for delete
  to anon
  using (auth.uid() = user_id);

create policy "users can delete own campaigns - authenticated" on campaigns
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- ====================
-- 8. rls policies for player_characters
-- ====================

-- select policy: users can view characters only from their own campaigns
create policy "users can view characters from own campaigns - anon" on player_characters
  for select
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = player_characters.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can view characters from own campaigns - authenticated" on player_characters
  for select
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = player_characters.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- insert policy: users can create characters only in their own campaigns
create policy "users can create characters in own campaigns - anon" on player_characters
  for insert
  to anon
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create characters in own campaigns - authenticated" on player_characters
  for insert
  to authenticated
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- update policy: users can update characters only from their own campaigns
create policy "users can update characters from own campaigns - anon" on player_characters
  for update
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = player_characters.campaign_id
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

create policy "users can update characters from own campaigns - authenticated" on player_characters
  for update
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = player_characters.campaign_id
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

-- delete policy: users can delete characters only from their own campaigns
create policy "users can delete characters from own campaigns - anon" on player_characters
  for delete
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = player_characters.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete characters from own campaigns - authenticated" on player_characters
  for delete
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = player_characters.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- ====================
-- 9. rls policies for combats
-- ====================

-- select policy: users can view combats only from their own campaigns
create policy "users can view combats from own campaigns - anon" on combats
  for select
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = combats.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can view combats from own campaigns - authenticated" on combats
  for select
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = combats.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- insert policy: users can create combats only in their own campaigns
create policy "users can create combats in own campaigns - anon" on combats
  for insert
  to anon
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can create combats in own campaigns - authenticated" on combats
  for insert
  to authenticated
  with check (
    exists (
      select 1 from campaigns
      where campaigns.id = campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- update policy: users can update combats only from their own campaigns
create policy "users can update combats from own campaigns - anon" on combats
  for update
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = combats.campaign_id
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

create policy "users can update combats from own campaigns - authenticated" on combats
  for update
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = combats.campaign_id
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

-- delete policy: users can delete combats only from their own campaigns
-- cascade will automatically delete related combat_participants
create policy "users can delete combats from own campaigns - anon" on combats
  for delete
  to anon
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = combats.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

create policy "users can delete combats from own campaigns - authenticated" on combats
  for delete
  to authenticated
  using (
    exists (
      select 1 from campaigns
      where campaigns.id = combats.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- ====================
-- 10. rls policies for global libraries (monsters, spells, conditions)
-- ====================
-- these tables are publicly readable by all users (including anonymous)
-- only administrators should have write access (not implemented in mvp)

-- monsters: public read access
create policy "public read access to monsters - anon" on monsters
  for select
  to anon
  using (true);

create policy "public read access to monsters - authenticated" on monsters
  for select
  to authenticated
  using (true);

-- spells: public read access
create policy "public read access to spells - anon" on spells
  for select
  to anon
  using (true);

create policy "public read access to spells - authenticated" on spells
  for select
  to authenticated
  using (true);

-- conditions: public read access
create policy "public read access to conditions - anon" on conditions
  for select
  to anon
  using (true);

create policy "public read access to conditions - authenticated" on conditions
  for select
  to authenticated
  using (true);
