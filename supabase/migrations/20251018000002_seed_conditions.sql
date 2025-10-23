-- migration: seed_conditions.sql
-- purpose: populate conditions table with D&D 5e condition data
-- notes: contains 15 conditions from D&D 5e
--        uses custom id values from JSON for consistency
--        uses ON CONFLICT DO NOTHING for safe re-runs

-- ====================
-- seed conditions table
-- ====================

INSERT INTO conditions (id, name, description) VALUES
('blinded', '{"en":"Blinded","pl":"Oślepiony"}'::jsonb, 'While you have the Blinded condition, you experience the following effects.
**Can''t See.** You can''t see and automatically fail any ability check that requires sight.
**Attacks Affected.** Attack rolls against you have Advantage, and your attack rolls have Disadvantage.'),
('charmed', '{"en":"Charmed","pl":"Zauroczony"}'::jsonb, 'While you have the Charmed condition, you experience the following effects.
**Can''t Harm the Charmer.** You can''t attack the charmer or target the charmer with damaging abilities or magical effects.
**Social Advantage.** The charmer has Advantage on ability checks to interact socially with you.'),
('deafened', '{"en":"Deafened","pl":"Głuchy"}'::jsonb, 'While you have the Deafened condition, you experience the following effect.
**Can''t Hear.** You can''t hear and automatically fail any ability check that requires hearing.'),
('exhaustion', '{"en":"Exhaustion","pl":"Wyczerpanie"}'::jsonb, 'While you have the Exhaustion condition, you experience the following effects.
**Exhaustion Levels.** This condition is cumulative. Each time you receive it, you gain 1 Exhaustion level. You die if your Exhaustion level is 6.
**D20 Tests Affected.** When you make a D20 Test, the roll is reduced by 2 times your Exhaustion level.
**Speed Reduced.** Your Speed is reduced by a number of feet equal to 5 times your Exhaustion level.
**Removing Exhaustion Levels.** Finishing a Long Rest removes 1 of your Exhaustion levels. When your Exhaustion level reaches 0, the condition ends.'),
('frightened', '{"en":"Frightened","pl":"Przerażony"}'::jsonb, 'While you have the Frightened condition, you experience the following effects.
**Ability Checks and Attacks Affected.** You have Disadvantage on ability checks and attack rolls while the source of fear is within line of sight.
**Can''t Approach.** You can''t willingly move closer to the source of your fear.'),
('grappled', '{"en":"Grappled","pl":"Schwytany"}'::jsonb, 'While you have the Grappled condition, you experience the following effects.
**Speed 0.** Your Speed is 0 and can''t increase.
**Attacks Affected.** You have Disadvantage on attack rolls against any target other than the grappler.
**Movable.** The grappler can drag or carry you when it moves, but every foot of movement costs it 1 extra foot unless you are Tiny or two or more sizes smaller.'),
('incapacitated', '{"en":"Incapacitated","pl":"Obezwładniony"}'::jsonb, 'While you have the Incapacitated condition, you experience the following effects.
**Inactive.** You can''t take any action, Bonus Action, or Reaction.
**No Concentration.** Your Concentration is broken.
**Speechless.** You can''t speak.
**Surprised.** If you''re Incapacitated when you roll Initiative, you have Disadvantage on the roll.'),
('invisible', '{"en":"Invisible","pl":"Niewidzialny"}'::jsonb, 'While you have the Invisible condition, you experience the following effects.
**Surprise.** If you''re Invisible when you roll Initiative, you have Advantage on the roll.
**Concealed.** You aren''t affected by any effect that requires its target to be seen unless the effect''s creator can somehow see you. Any equipment you are wearing or carrying is also concealed.
**Attacks Affected.** Attack rolls against you have Disadvantage, and your attack rolls have Advantage. If a creature can somehow see you, you don''t gain this benefit against that creature.'),
('paralyzed', '{"en":"Paralyzed","pl":"Sparaliżowany"}'::jsonb, 'While you have the Paralyzed condition, you experience the following effects.
**Incapacitated.** You have the Incapacitated condition.
**Speed 0.** Your Speed is 0 and can''t increase.
**Saving Throws Affected.** You automatically fail Strength and Dexterity saving throws.
**Attacks Affected.** Attack rolls against you have Advantage.
**Automatic Critical Hits.** Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you.'),
('petrified', '{"en":"Petrified","pl":"Spetryfikowany"}'::jsonb, 'While you have the Petrified condition, you experience the following effects.
**Turned to Inanimate Substance.** You are transformed, along with any nonmagical objects you are wearing and carrying, into a solid inanimate substance (usually stone). Your weight increases by a factor of ten, and you cease aging.
**Incapacitated.** You have the Incapacitated condition.
**Speed 0.** Your Speed is 0 and can''t increase.
**Attacks Affected.** Attack rolls against you have Advantage.
**Saving Throws Affected.** You automatically fail Strength and Dexterity saving throws.
**Resist Damage.** You have Resistance to all damage.
**Poison Immunity.** You have Immunity to the Poisoned condition.
**Saving Throws Affected.** You automatically fail Strength and Dexterity saving throws.
**Resist Damage.** You have Resistance to all damage.
**Poison Immunity.** You have Immunity to the Poisoned condition.'),
('poisoned', '{"en":"Poisoned","pl":"Zatrucie"}'::jsonb, 'While you have the Poisoned condition, you experience the following effect.
**Ability Checks and Attacks Affected.** You have Disadvantage on attack rolls and ability checks.'),
('prone', '{"en":"Prone","pl":"Leżący"}'::jsonb, 'While you have the Prone condition, you experience the following effects.
**Restricted Movement.** Your only movement options are to crawl or to spend an amount of movement equal to half your Speed (round down) to right yourself and thereby end the condition. If your Speed is 0, you can''t right yourself.
**Attacks Affected.** You have Disadvantage on attack rolls. An attack roll against you has Advantage if the attacker is within 5 feet of you. Otherwise, that attack roll has Disadvantage.'),
('restrained', '{"en":"Restrained","pl":"Skrępowany"}'::jsonb, 'While you have the Restrained condition, you experience the following effects.
**Speed 0.** Your Speed is 0 and can''t increase.
**Attacks Affected.** Attack rolls against you have Advantage, and your attack rolls have Disadvantage.
**Saving Throws Affected.** You have Disadvantage on Dexterity saving throws.'),
('stunned', '{"en":"Stunned","pl":"Ogłuszony"}'::jsonb, 'While you have the Stunned condition, you experience the following effects.
**Incapacitated.** You have the Incapacitated condition.
**Saving Throws Affected.** You automatically fail Strength and Dexterity saving throws.
**Attacks Affected.** Attack rolls against you have Advantage.'),
('unconscious', '{"en":"Unconscious","pl":"Nieprzytomny"}'::jsonb, 'While you have the Unconscious condition, you experience the following effects.
**Inert.** You have the Incapacitated and Prone conditions, and you drop whatever you''re holding.
**When this condition ends, you remain Prone.
**Speed 0.** Your Speed is 0 and can''t increase.
**Attacks Affected.** Attack rolls against you have Advantage.
**Saving Throws Affected.** You automatically fail Strength and Dexterity saving throws.
**Automatic Critical Hits.** Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you.
**Unaware.** You''re unaware of your surroundings.')
ON CONFLICT (id) DO NOTHING;
