-- migration: create_equipment_tables.sql
-- purpose: create tables for D&D equipment, weapon properties, and weapon mastery properties
-- tables affected: equipment, weapon_properties, weapon_mastery_properties
-- notes: follows same pattern as spells/monsters/conditions tables
--        equipment data stored as jsonb for flexible schema
--        all tables have public read access via RLS policies

-- ====================
-- 1. create equipment table
-- ====================
-- global library of D&D equipment (weapons, armor, tools, adventuring gear)
-- equipment data stored as jsonb (similar to spells table)

create table equipment (
  id uuid primary key default gen_random_uuid(),
  -- name extracted from jsonb for easier searching and indexing
  name text not null,
  -- all equipment data (cost, weight, properties, etc.) stored as jsonb
  data jsonb not null,
  created_at timestamp with time zone not null default now()
);

-- enable row level security for equipment
alter table equipment enable row level security;

-- create b-tree index for searching by name
create index idx_equipment_name on equipment(name);

-- create gin index for filtering by nested jsonb fields
create index idx_equipment_data_gin on equipment using gin(data);

-- ====================
-- 2. create weapon_properties table
-- ====================
-- static reference table for weapon property definitions
-- properties like "Finesse", "Light", "Heavy", "Versatile", etc.

create table weapon_properties (
  id text primary key,  -- Using text ID from JSON data (e.g., 'finesse', 'light')
  name jsonb not null,  -- Localized name: { "en": "Finesse", "pl": "Finezyjna" }
  description text not null,

  -- Validate JSONB structure has required language keys
  constraint name_has_en check (name ? 'en'),
  constraint name_has_pl check (name ? 'pl')
);

-- enable row level security for weapon_properties
alter table weapon_properties enable row level security;

-- ====================
-- 3. create weapon_mastery_properties table
-- ====================
-- static reference table for weapon mastery property definitions
-- mastery properties like "Cleave", "Graze", "Nick", "Push", etc.

create table weapon_mastery_properties (
  id text primary key,  -- Using text ID from JSON data (e.g., 'cleave', 'graze')
  name jsonb not null,  -- Localized name: { "en": "Cleave", "pl": "Rąbanie" }
  description text not null,

  -- Validate JSONB structure has required language keys
  constraint name_has_en check (name ? 'en'),
  constraint name_has_pl check (name ? 'pl')
);

-- enable row level security for weapon_mastery_properties
alter table weapon_mastery_properties enable row level security;

-- ====================
-- 4. rls policies for equipment
-- ====================
-- equipment table is publicly readable by all users (including anonymous)
-- only administrators should have write access (not implemented in mvp)

-- public read access
create policy "public read access to equipment - anon" on equipment
  for select
  to anon
  using (true);

create policy "public read access to equipment - authenticated" on equipment
  for select
  to authenticated
  using (true);

-- ====================
-- 5. rls policies for weapon_properties
-- ====================
-- weapon_properties table is publicly readable by all users

create policy "public read access to weapon_properties - anon" on weapon_properties
  for select
  to anon
  using (true);

create policy "public read access to weapon_properties - authenticated" on weapon_properties
  for select
  to authenticated
  using (true);

-- ====================
-- 6. rls policies for weapon_mastery_properties
-- ====================
-- weapon_mastery_properties table is publicly readable by all users

create policy "public read access to weapon_mastery_properties - anon" on weapon_mastery_properties
  for select
  to anon
  using (true);

create policy "public read access to weapon_mastery_properties - authenticated" on weapon_mastery_properties
  for select
  to authenticated
  using (true);
