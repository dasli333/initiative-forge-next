-- Drop the unused related_entities_json column from timeline_events table
-- This field was planned for auto-extraction of @mentions but was never implemented
-- Entity relationships are tracked via entity_mentions table instead

ALTER TABLE timeline_events DROP COLUMN IF EXISTS related_entities_json;
