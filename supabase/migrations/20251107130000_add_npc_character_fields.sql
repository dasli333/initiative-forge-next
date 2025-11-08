-- ====================
-- Add character sheet fields to NPCs
-- ====================
-- Adds D&D character sheet-style fields for NPC details:
-- - race: character species (Human, Elf, Dwarf, etc.)
-- - age: character age in years
-- - alignment: D&D alignment (LG, NG, CG, LN, N, CN, LE, NE, CE)
-- - languages: array of languages spoken
-- - distinguishing_features: physical/behavioral characteristics
-- - secrets: GM-only information about the character

alter table npcs
  add column race text,
  add column age smallint,
  add column alignment text,
  add column languages text[],
  add column distinguishing_features text,
  add column secrets text;

-- add check constraint for alignment (valid D&D alignments)
alter table npcs
  add constraint npcs_alignment_check
  check (alignment is null or alignment in ('LG', 'NG', 'CG', 'LN', 'N', 'CN', 'LE', 'NE', 'CE'));

-- add check constraint for age (reasonable range)
alter table npcs
  add constraint npcs_age_check
  check (age is null or (age >= 0 and age <= 10000));

-- create index for filtering by race
create index idx_npcs_race on npcs(race) where race is not null;

-- create index for filtering by alignment
create index idx_npcs_alignment on npcs(alignment) where alignment is not null;

-- create GIN index for languages array searches
create index idx_npcs_languages_gin on npcs using gin(languages) where languages is not null;
