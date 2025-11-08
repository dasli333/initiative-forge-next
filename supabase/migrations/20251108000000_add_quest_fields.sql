-- Add missing fields to quests table for comprehensive quest management
-- Migration: 20251108000000_add_quest_fields.sql

-- Add new columns
ALTER TABLE quests
  ADD COLUMN quest_giver_id uuid REFERENCES npcs(id) ON DELETE SET NULL,
  ADD COLUMN quest_type text NOT NULL DEFAULT 'side',
  ADD COLUMN notes text,
  ADD COLUMN start_date text,
  ADD COLUMN deadline text;

-- Add check constraint for quest_type
ALTER TABLE quests
  ADD CONSTRAINT quests_quest_type_check CHECK (quest_type IN ('main', 'side'));

-- Create indexes for better query performance
CREATE INDEX idx_quests_quest_giver_id ON quests(quest_giver_id) WHERE quest_giver_id IS NOT NULL;
CREATE INDEX idx_quests_quest_type ON quests(quest_type);

-- Add comment for documentation
COMMENT ON COLUMN quests.quest_giver_id IS 'NPC who gives this quest (nullable)';
COMMENT ON COLUMN quests.quest_type IS 'Quest classification: main (story-critical) or side (optional)';
COMMENT ON COLUMN quests.notes IS 'DM notes, clues, and hints for running the quest';
COMMENT ON COLUMN quests.start_date IS 'In-game date when quest started (freeform text)';
COMMENT ON COLUMN quests.deadline IS 'In-game deadline for quest completion (freeform text)';
