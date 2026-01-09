-- ====================
-- Upgrade NPC Combat Abilities
-- ====================
-- Upgrades NPC combat system to match monster structure with full ability types
-- Adds traits, bonus actions, reactions, legendary actions
-- Adds combat properties: vulnerabilities, resistances, immunities, gear
-- Changes speed from smallint to text[] to match monster format

-- Step 1: Add new columns to npc_combat_stats
ALTER TABLE npc_combat_stats
  -- Change speed type (requires dropping and recreating)
  DROP COLUMN speed;

ALTER TABLE npc_combat_stats
  -- Re-add speed as text array to match monster format
  ADD COLUMN speed text[] DEFAULT ARRAY['30 ft.'],
  -- Ability types
  ADD COLUMN traits_json jsonb,
  ADD COLUMN bonus_actions_json jsonb,
  ADD COLUMN reactions_json jsonb,
  ADD COLUMN legendary_actions_json jsonb,
  -- Combat properties
  ADD COLUMN damage_vulnerabilities text[],
  ADD COLUMN damage_resistances text[],
  ADD COLUMN damage_immunities text[],
  ADD COLUMN condition_immunities text[],
  ADD COLUMN gear text[];

-- Add comments for documentation
COMMENT ON COLUMN npc_combat_stats.speed IS 'Movement speeds array (e.g., ["30 ft.", "swim 40 ft."])';
COMMENT ON COLUMN npc_combat_stats.traits_json IS 'Passive traits/special abilities (MonsterTrait[])';
COMMENT ON COLUMN npc_combat_stats.bonus_actions_json IS 'Bonus actions (MonsterAction[])';
COMMENT ON COLUMN npc_combat_stats.reactions_json IS 'Reactions (MonsterAction[])';
COMMENT ON COLUMN npc_combat_stats.legendary_actions_json IS 'Legendary actions structure (LegendaryActions)';
COMMENT ON COLUMN npc_combat_stats.damage_vulnerabilities IS 'Damage types NPC is vulnerable to';
COMMENT ON COLUMN npc_combat_stats.damage_resistances IS 'Damage types NPC resists';
COMMENT ON COLUMN npc_combat_stats.damage_immunities IS 'Damage types NPC is immune to';
COMMENT ON COLUMN npc_combat_stats.condition_immunities IS 'Conditions NPC is immune to';
COMMENT ON COLUMN npc_combat_stats.gear IS 'Equipment/gear list';
