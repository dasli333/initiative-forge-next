-- Fix Priest's Pack and Scholar's Pack contents structure
-- Change from flat structure to nested structure with item wrapper

UPDATE equipment
SET data = jsonb_set(
  data,
  '{contents}',
  '[
    {"item":{"id":"backpack","name":"Backpack"},"quantity":1},
    {"item":{"id":"blanket","name":"Blanket"},"quantity":1},
    {"item":{"id":"holy-water","name":"Holy Water"},"quantity":1},
    {"item":{"id":"lamp","name":"Lamp"},"quantity":1},
    {"item":{"id":"rations","name":"Rations"},"quantity":7},
    {"item":{"id":"robe","name":"Robe"},"quantity":1},
    {"item":{"id":"tinderbox","name":"Tinderbox"},"quantity":1}
  ]'::jsonb
)
WHERE name = 'Priest''s Pack';

UPDATE equipment
SET data = jsonb_set(
  jsonb_set(
    data,
    '{contents}',
    '[
      {"item":{"id":"backpack","name":"Backpack"},"quantity":1},
      {"item":{"id":"blanket","name":"Blanket"},"quantity":1},
      {"item":{"id":"book","name":"Book"},"quantity":1},
      {"item":{"id":"ink","name":"Ink"},"quantity":1},
      {"item":{"id":"ink-pen","name":"Ink Pen"},"quantity":1},
      {"item":{"id":"lamp","name":"Lamp"},"quantity":1},
      {"item":{"id":"oil","name":"Oil"},"quantity":10},
      {"item":{"id":"parchment","name":"Parchment"},"quantity":10},
      {"item":{"id":"tinderbox","name":"Tinderbox"},"quantity":1}
    ]'::jsonb
  ),
  '{container}',
  'null'::jsonb
)
WHERE name = 'Scholar''s Pack';

-- Remove the container field from Scholar's Pack (set to null then remove)
UPDATE equipment
SET data = data - 'container'
WHERE name = 'Scholar''s Pack';
