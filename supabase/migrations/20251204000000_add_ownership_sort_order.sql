-- Migration: Add sort_order to existing ownership history entries
-- Iterates through all story_items and adds sort_order field to each entry

DO $$
DECLARE
  item_record RECORD;
  history_array jsonb;
  updated_history jsonb;
  entry jsonb;
  idx integer;
BEGIN
  -- Loop through all story_items with non-null ownership_history_json
  FOR item_record IN
    SELECT id, ownership_history_json
    FROM story_items
    WHERE ownership_history_json IS NOT NULL
      AND jsonb_array_length(ownership_history_json) > 0
  LOOP
    history_array := item_record.ownership_history_json;
    updated_history := '[]'::jsonb;
    idx := 0;

    -- Add sort_order to each entry
    FOR entry IN SELECT * FROM jsonb_array_elements(history_array)
    LOOP
      -- Check if sort_order already exists, otherwise add it
      IF entry ? 'sort_order' THEN
        updated_history := updated_history || jsonb_build_array(entry);
      ELSE
        updated_history := updated_history || jsonb_build_array(
          entry || jsonb_build_object('sort_order', idx)
        );
      END IF;
      idx := idx + 1;
    END LOOP;

    -- Update the record
    UPDATE story_items
    SET ownership_history_json = updated_history
    WHERE id = item_record.id;
  END LOOP;

  RAISE NOTICE 'Migration completed successfully';
END $$;
