-- Drop the unused quest_entities table and its RLS policies
-- This table was planned for manual entity-quest linking but was never implemented in the UI
-- Entity relationships are tracked via entity_mentions table instead (auto-extracted from @mentions)

-- Drop RLS policies
DROP POLICY IF EXISTS "users can view quest entities from own campaigns - anon" ON quest_entities;
DROP POLICY IF EXISTS "users can view quest entities from own campaigns - authenticated" ON quest_entities;
DROP POLICY IF EXISTS "users can create quest entities in own campaigns - anon" ON quest_entities;
DROP POLICY IF EXISTS "users can create quest entities in own campaigns - authenticated" ON quest_entities;
DROP POLICY IF EXISTS "users can delete quest entities from own campaigns - anon" ON quest_entities;
DROP POLICY IF EXISTS "users can delete quest entities from own campaigns - authenticated" ON quest_entities;

-- Drop the table
DROP TABLE IF EXISTS quest_entities;
