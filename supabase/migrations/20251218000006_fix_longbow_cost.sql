-- migration: fix_longbow_cost.sql
-- purpose: fix longbow cost from 5 gp to 50 gp
-- notes: longbow price was incorrectly set to 5 gp, should be 50 gp

UPDATE equipment
SET data = jsonb_set(
  data,
  '{cost,quantity}',
  '50'::jsonb
)
WHERE name = 'Longbow';
