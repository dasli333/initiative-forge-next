-- Convert NPC secrets and Player Character notes from plain text to rich text (jsonb)
-- This enables @mentions support and rich formatting

-- ============================================================================
-- NPCs: Convert secrets from text to jsonb
-- ============================================================================

-- Step 1: Add new jsonb column
alter table npcs
  add column secrets_json jsonb;

-- Step 2: Migrate existing data
-- Wrap plain text in Tiptap JSON structure
update npcs
  set secrets_json = jsonb_build_object(
    'type', 'doc',
    'content', jsonb_build_array(
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(
          jsonb_build_object(
            'type', 'text',
            'text', secrets
          )
        )
      )
    )
  )
  where secrets is not null and secrets != '';

-- Step 3: Drop old text column
alter table npcs
  drop column secrets;

-- Step 4: Rename new column
alter table npcs
  rename column secrets_json to secrets;

-- Step 5: Add GIN index for efficient JSON search
create index idx_npcs_secrets_gin
  on npcs using gin(secrets)
  where secrets is not null;

-- Step 6: Update column comment
comment on column npcs.secrets is
  'Rich text GM-only secret information with @mentions support (Tiptap JSON format)';


-- ============================================================================
-- Player Characters: Convert notes from text to jsonb
-- ============================================================================

-- Step 1: Add new jsonb column
alter table player_characters
  add column notes_json jsonb;

-- Step 2: Migrate existing data
-- Wrap plain text in Tiptap JSON structure
update player_characters
  set notes_json = jsonb_build_object(
    'type', 'doc',
    'content', jsonb_build_array(
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(
          jsonb_build_object(
            'type', 'text',
            'text', notes
          )
        )
      )
    )
  )
  where notes is not null and notes != '';

-- Step 3: Drop old text column
alter table player_characters
  drop column notes;

-- Step 4: Rename new column
alter table player_characters
  rename column notes_json to notes;

-- Step 5: Add GIN index for efficient JSON search
create index idx_player_characters_notes_gin
  on player_characters using gin(notes)
  where notes is not null;

-- Step 6: Update column comment
comment on column player_characters.notes is
  'Rich text DM-only private notes with @mentions support (Tiptap JSON format)';
