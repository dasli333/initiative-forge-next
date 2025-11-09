-- ====================
-- Create pc_npc_relationships table
-- ====================
-- Tracks relationships between player characters and NPCs
-- Unidirectional storage (PC → NPC), bidirectional display:
-- - PC detail panel: editable relationships
-- - NPC detail panel: shows PCs related to this NPC (read-only)

create table pc_npc_relationships (
  id uuid primary key default gen_random_uuid(),
  player_character_id uuid not null references player_characters(id) on delete cascade,
  npc_id uuid not null references npcs(id) on delete cascade,
  relationship_type text not null,
  description text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- ensure one relationship per PC-NPC pair
  unique (player_character_id, npc_id)
);

alter table pc_npc_relationships enable row level security;

-- create indexes for efficient querying from both directions
create index idx_pc_npc_relationships_pc on pc_npc_relationships(player_character_id);
create index idx_pc_npc_relationships_npc on pc_npc_relationships(npc_id);

-- add comments for documentation
comment on table pc_npc_relationships is 'Relationships between player characters and NPCs (e.g., mentor, ally, rival)';
comment on column pc_npc_relationships.player_character_id is 'Player character in the relationship';
comment on column pc_npc_relationships.npc_id is 'NPC in the relationship';
comment on column pc_npc_relationships.relationship_type is 'Type of relationship (e.g., "mentor", "ally", "rival", "father", "enemy")';
comment on column pc_npc_relationships.description is 'Optional description providing context about the relationship';
