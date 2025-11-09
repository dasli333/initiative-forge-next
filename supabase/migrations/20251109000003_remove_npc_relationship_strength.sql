-- ====================
-- Remove strength field from npc_relationships
-- ====================
-- The strength field is unnecessary - relationship strength can be described
-- in the description field if needed, making it more flexible and intuitive

alter table npc_relationships
  drop column strength;

comment on table npc_relationships is 'Relationships between NPCs (bidirectional). Relationship strength/intensity can be described in the description field.';
