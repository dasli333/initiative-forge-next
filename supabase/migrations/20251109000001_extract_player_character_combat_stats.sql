-- ====================
-- Extract combat stats to separate table
-- ====================
-- Moves combat-related fields from player_characters to player_character_combat_stats
-- This makes combat stats optional (not all PCs need combat stats)
-- Mirrors npc_combat_stats pattern for consistency

-- create player_character_combat_stats table
create table player_character_combat_stats (
  player_character_id uuid primary key references player_characters(id) on delete cascade,
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

alter table player_character_combat_stats enable row level security;

-- migrate existing combat data from player_characters to player_character_combat_stats
-- all existing player characters have combat stats (they were required fields)
insert into player_character_combat_stats (
  player_character_id,
  hp_max,
  armor_class,
  speed,
  strength,
  dexterity,
  constitution,
  intelligence,
  wisdom,
  charisma,
  actions_json,
  created_at,
  updated_at
)
select
  id,
  max_hp,
  armor_class,
  speed,
  strength,
  dexterity,
  constitution,
  intelligence,
  wisdom,
  charisma,
  actions,
  created_at,
  updated_at
from player_characters;

-- drop old combat columns from player_characters
alter table player_characters
  drop column max_hp,
  drop column armor_class,
  drop column speed,
  drop column strength,
  drop column dexterity,
  drop column constitution,
  drop column intelligence,
  drop column wisdom,
  drop column charisma,
  drop column actions;

-- add comments for documentation
comment on table player_character_combat_stats is 'Optional combat statistics for player characters (separated for flexibility)';
comment on column player_character_combat_stats.player_character_id is 'Foreign key to player_characters (also primary key)';
comment on column player_character_combat_stats.hp_max is 'Maximum hit points';
comment on column player_character_combat_stats.armor_class is 'Armor class (AC)';
comment on column player_character_combat_stats.speed is 'Movement speed in feet';
comment on column player_character_combat_stats.actions_json is 'Array of combat actions (attacks, spells, abilities)';
