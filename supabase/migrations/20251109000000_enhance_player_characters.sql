-- ====================
-- Enhance player_characters table with character sheet fields
-- ====================
-- Adds comprehensive D&D character information:
-- - class/level: character progression tracking
-- - race/background/alignment: core character sheet fields
-- - age/languages: additional character details
-- - faction_id: organizational affiliation
-- - image_url: character portrait
-- - biography_json/personality_json: rich text character narratives (with @mentions support)
-- - notes: DM-only private notes
-- - status: track active/retired/deceased characters

alter table player_characters
  add column class text,
  add column level smallint,
  add column race text,
  add column background text,
  add column alignment text,
  add column age smallint,
  add column languages text[],
  add column faction_id uuid references factions(id) on delete set null,
  add column image_url text,
  add column biography_json jsonb,
  add column personality_json jsonb,
  add column notes text,
  add column status text not null default 'active';

-- add check constraint for alignment (valid D&D alignments)
alter table player_characters
  add constraint player_characters_alignment_check
  check (alignment is null or alignment in ('LG', 'NG', 'CG', 'LN', 'N', 'CN', 'LE', 'NE', 'CE'));

-- add check constraint for age (reasonable range)
alter table player_characters
  add constraint player_characters_age_check
  check (age is null or (age >= 0 and age <= 10000));

-- add check constraint for level (D&D 5e levels 1-20)
alter table player_characters
  add constraint player_characters_level_check
  check (level is null or (level >= 1 and level <= 20));

-- add check constraint for status
alter table player_characters
  add constraint player_characters_status_check
  check (status in ('active', 'retired', 'deceased'));

-- create indexes for filtering and performance
create index idx_player_characters_status on player_characters(status);
create index idx_player_characters_class on player_characters(class) where class is not null;
create index idx_player_characters_faction_id on player_characters(faction_id) where faction_id is not null;
create index idx_player_characters_alignment on player_characters(alignment) where alignment is not null;
create index idx_player_characters_level on player_characters(level) where level is not null;

-- create GIN index for languages array searches
create index idx_player_characters_languages_gin on player_characters using gin(languages) where languages is not null;

-- create GIN indexes for rich text JSON content search
create index idx_player_characters_biography_gin on player_characters using gin(biography_json) where biography_json is not null;
create index idx_player_characters_personality_gin on player_characters using gin(personality_json) where personality_json is not null;

-- add comments for documentation
comment on column player_characters.class is 'Character class (e.g., "Fighter", "Wizard", "Rogue/Fighter" for multiclass)';
comment on column player_characters.level is 'Character level (1-20)';
comment on column player_characters.race is 'Character species/lineage (e.g., "Human", "Elf", "Dwarf")';
comment on column player_characters.background is 'D&D 5e background (e.g., "Noble", "Soldier", "Criminal")';
comment on column player_characters.alignment is 'D&D alignment: LG, NG, CG, LN, N, CN, LE, NE, CE';
comment on column player_characters.age is 'Character age in years';
comment on column player_characters.languages is 'Array of languages spoken by character';
comment on column player_characters.faction_id is 'Faction affiliation (nullable)';
comment on column player_characters.image_url is 'URL to character portrait image';
comment on column player_characters.biography_json is 'Rich text character backstory with @mentions support';
comment on column player_characters.personality_json is 'Rich text personality traits and characteristics';
comment on column player_characters.notes is 'DM-only private notes about the character';
comment on column player_characters.status is 'Character lifecycle: active (current), retired (inactive), deceased (dead)';
