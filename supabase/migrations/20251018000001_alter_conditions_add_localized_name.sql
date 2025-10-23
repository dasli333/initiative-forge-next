-- migration: alter_conditions_add_localized_name.sql
-- purpose: update conditions table to support localized names (en/pl)
-- notes: drops and recreates the conditions table with JSONB name field
--        this is safe as conditions are reference data that will be re-seeded

-- ====================
-- drop existing conditions table
-- ====================

DROP TABLE IF EXISTS conditions CASCADE;

-- ====================
-- recreate conditions table with localized names
-- ====================

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
-- rls policies for conditions (public read access)
-- ====================

-- conditions: public read access for anonymous users
create policy "public read access to conditions - anon" on conditions
  for select
  to anon
  using (true);

-- conditions: public read access for authenticated users
create policy "public read access to conditions - authenticated" on conditions
  for select
  to authenticated
  using (true);
