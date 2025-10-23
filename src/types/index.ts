// Type definitions for DTOs and Command Models
// Auto-generated based on database schema and API plan

import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";
import type { MonsterAction, MonsterTrait, LegendaryActions } from "@/lib/schemas/monster.schema";

// ============================================================================
// ENTITY TYPES (Direct mappings from database tables)
// ============================================================================

export type Campaign = Tables<"campaigns">;
export type PlayerCharacter = Tables<"player_characters">;
export type Monster = Tables<"monsters">;
export type Spell = Tables<"spells">;
export type Condition = Tables<"conditions">;
export type Combat = Tables<"combats">;

// ============================================================================
// SHARED / UTILITY TYPES
// ============================================================================

/**
 * Stats structure used in player characters, combat participants, and ad-hoc NPCs
 */
export interface StatsDTO {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

/**
 * Action structure used in player characters, monsters, and combat participants
 */
export interface ActionDTO {
  name: string;
  type: string;
  attack_bonus?: number;
  reach?: string;
  range?: string;
  damage_dice?: string;
  damage_bonus?: number;
  damage_type?: string;
  description?: string;
  attackRoll?: {
    type: string;
    bonus: number;
  };
  damage?: {
    average: number;
    formula: string;
    type?: string;
  }[];
}

/**
 * Active condition in combat (applied to a participant)
 */
export interface ActiveConditionDTO {
  condition_id: string;
  name: string;
  duration_in_rounds: number | null; // null = indefinite
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMetadataDTO {
  total: number;
  limit: number;
  offset: number;
}

// ============================================================================
// CAMPAIGN DTOs
// ============================================================================

/**
 * Campaign DTO (used in GET, POST, PATCH responses)
 */
export type CampaignDTO = Campaign;

/**
 * List campaigns response with pagination
 */
export interface ListCampaignsResponseDTO extends PaginationMetadataDTO {
  campaigns: CampaignDTO[];
}

// ============================================================================
// CAMPAIGN COMMAND MODELS
// ============================================================================

/**
 * Create campaign command (POST /api/campaigns)
 * Only name is required - user_id is added server-side from auth context
 */
export type CreateCampaignCommand = Pick<TablesInsert<"campaigns">, "name">;

/**
 * Update campaign command (PATCH /api/campaigns/:id)
 * Only name can be updated
 */
export type UpdateCampaignCommand = Pick<TablesUpdate<"campaigns">, "name">;

// ============================================================================
// PLAYER CHARACTER DTOs
// ============================================================================

/**
 * Player character DTO with typed actions field
 * The database stores actions as Json, but we expose it as ActionDTO[]
 */
export type PlayerCharacterDTO = Omit<PlayerCharacter, "actions"> & {
  actions: ActionDTO[] | null;
};

/**
 * List player characters response
 */
export interface ListPlayerCharactersResponseDTO {
  characters: PlayerCharacterDTO[];
}

// ============================================================================
// PLAYER CHARACTER COMMAND MODELS
// ============================================================================

/**
 * Create player character command (POST /api/campaigns/:campaignId/characters)
 * campaign_id comes from URL parameter, id/timestamps are auto-generated
 */
export type CreatePlayerCharacterCommand = Omit<
  TablesInsert<"player_characters">,
  "campaign_id" | "id" | "created_at" | "updated_at" | "actions"
> & {
  actions?: ActionDTO[];
};

/**
 * Update player character command (PATCH /api/campaigns/:campaignId/characters/:id)
 * All fields optional for partial updates
 */
export type UpdatePlayerCharacterCommand = Omit<
  TablesUpdate<"player_characters">,
  "campaign_id" | "id" | "created_at" | "updated_at" | "actions"
> & {
  actions?: ActionDTO[];
};

// ============================================================================
// MONSTER DTOs
// ============================================================================

/**
 * Monster data structure (from SRD JSON)
 * This is the typed version of the 'data' JSONB field in monsters table
 */
export interface MonsterDataDTO {
  name: {
    en: string;
    pl: string;
  };
  size: string;
  type: string;
  category: string;
  alignment: string;
  senses: string[];
  languages: string[];
  abilityScores: {
    strength: { score: number; modifier: number; save: number };
    dexterity: { score: number; modifier: number; save: number };
    constitution: { score: number; modifier: number; save: number };
    intelligence: { score: number; modifier: number; save: number };
    wisdom: { score: number; modifier: number; save: number };
    charisma: { score: number; modifier: number; save: number };
  };
  speed: string[];
  hitPoints: {
    average: number;
    formula: string;
  };
  armorClass: number;
  challengeRating: {
    rating: string;
    experiencePoints: number;
    proficiencyBonus: number;
  };
  skills: string[];
  damageVulnerabilities: string[];
  damageResistances: string[];
  damageImmunities: string[];
  conditionImmunities: string[];
  gear: string[];
  traits: MonsterTrait[];
  actions: MonsterAction[];
  bonusActions: MonsterAction[];
  reactions: MonsterAction[];
  initiative: {
    modifier: number;
    total: number;
  };
  legendaryActions?: LegendaryActions;
  id: string;
}

/**
 * Monster DTO with typed data field
 */
export type MonsterDTO = Omit<Monster, "data"> & {
  data: MonsterDataDTO;
};

/**
 * List monsters response with pagination
 */
export interface ListMonstersResponseDTO extends PaginationMetadataDTO {
  monsters: MonsterDTO[];
}

// ============================================================================
// SPELL DTOs
// ============================================================================

/**
 * Spell data structure (from SRD JSON)
 * This is the typed version of the 'data' JSONB field in spells table
 */
export interface SpellDataDTO {
  name: {
    en: string;
    pl: string;
  };
  level: number;
  school: string;
  isCantrip: boolean;
  classes: string[];
  castingTime: {
    time: string;
    isRitual: boolean;
  };
  range: string;
  components: {
    verbal: boolean;
    somatic: boolean;
    material: boolean;
    materialDescription?: string;
  };
  duration: {
    durationType: string;
    concentration: boolean;
  };
  description: string;
  attackType: string;
  ritual: boolean;
  tags: string[];
  damage?: {
    formula: string;
    damageType: string;
    average: number;
  }[];
  savingThrow?: {
    ability: string;
    success: string;
  };
  higherLevels?: string;
  id: string;
}

/**
 * Spell DTO with typed data field
 */
export type SpellDTO = Omit<Spell, "data"> & {
  data: SpellDataDTO;
};

/**
 * List spells response with pagination
 */
export interface ListSpellsResponseDTO extends PaginationMetadataDTO {
  spells: SpellDTO[];
}

// ============================================================================
// CONDITION DTOs
// ============================================================================

/**
 * Condition DTO with localized names
 * The database stores name as JSONB with structure { en: string, pl: string }
 */
export interface ConditionDTO {
  id: string;
  name: {
    en: string;
    pl: string;
  };
  description: string;
}

/**
 * List conditions response
 */
export interface ListConditionsResponseDTO {
  conditions: ConditionDTO[];
}

// ============================================================================
// COMBAT DTOs
// ============================================================================

/**
 * Combat participant in the combat tracker
 * This is denormalized data stored in combat state_snapshot
 */
export interface CombatParticipantDTO {
  id: string; // Temporary UUID for this combat instance
  source: "player_character" | "monster" | "ad_hoc_npc";

  // Reference IDs (if applicable)
  player_character_id?: string;
  monster_id?: string;

  // Denormalized data (snapshot at time of adding to combat)
  display_name: string;
  display_name_localized?: {
    en: string;
    pl: string;
  };
  initiative: number | null;
  current_hp: number;
  max_hp: number;
  armor_class: number;
  stats: StatsDTO;
  actions: ActionDTO[];

  // Combat properties (primarily from monsters)
  damageVulnerabilities?: string[];
  damageResistances?: string[];
  damageImmunities?: string[];
  conditionImmunities?: string[];
  gear?: string[];

  // Additional abilities (primarily from monsters)
  traits?: MonsterTrait[];
  bonusActions?: MonsterAction[];
  reactions?: MonsterAction[];
  legendaryActions?: LegendaryActions;

  // Combat-specific state
  is_active_turn: boolean;
  active_conditions: ActiveConditionDTO[];
}

/**
 * Combat state snapshot stored in combats.state_snapshot (JSONB)
 * This is the client-side Zustand state that gets persisted
 */
export interface CombatSnapshotDTO {
  participants: CombatParticipantDTO[];
  active_participant_index: number | null; // null = initiative not rolled yet
}

/**
 * Combat DTO with typed state_snapshot field
 */
export type CombatDTO = Omit<Combat, "state_snapshot"> & {
  state_snapshot: CombatSnapshotDTO | null;
};

// ============================================================================
// COMBAT COMMAND MODELS
// ============================================================================

/**
 * Initial participant specification for creating a combat
 * Union type supports three sources: player characters, monsters, and ad-hoc NPCs
 */
export type InitialParticipantCommand =
  | {
      source: "player_character";
      player_character_id: string;
    }
  | {
      source: "monster";
      monster_id: string;
      count: number; // How many copies of this monster
    }
  | {
      source: "ad_hoc_npc";
      display_name: string;
      max_hp: number;
      armor_class: number;
      stats: StatsDTO;
      actions?: ActionDTO[];
    };

/**
 * Create combat command (POST /api/campaigns/:campaignId/combats)
 * campaign_id comes from URL parameter
 * Server initializes state_snapshot based on initial_participants
 */
export interface CreateCombatCommand {
  name: string;
  initial_participants: InitialParticipantCommand[];
}

/**
 * Update combat snapshot command (PATCH /api/combats/:id/snapshot)
 * Called periodically from client to persist combat state
 */
export interface UpdateCombatSnapshotCommand {
  state_snapshot: CombatSnapshotDTO;
  current_round: number;
}

/**
 * Update combat status command (PATCH /api/combats/:id/status)
 * Used to mark combat as completed
 */
export interface UpdateCombatStatusCommand {
  status: "active" | "completed";
}

// ============================================================================
// VIEW MODELS (for UI components)
// ============================================================================

/**
 * ViewModel for logged-in user in UI
 */
export interface UserViewModel {
  id: string;
  email: string;
  avatar?: string; // URL to avatar (if available from Supabase auth)
}

/**
 * ViewModel for active combat
 * Used to show "Active" badge on Combat nav item
 */
export interface ActiveCombatViewModel {
  combat_id: string;
  campaign_id: string;
  status: "active";
}

/**
 * Aggregated ViewModel for Sidebar
 * (optional - can also manage individual pieces in hooks)
 */
export interface SidebarViewModel {
  user: UserViewModel | null;
  selectedCampaignId: string | null;
  campaigns: Campaign[];
  activeCombat: ActiveCombatViewModel | null;
  currentPath: string;
  isLoadingCampaigns: boolean;
  isLoadingActiveCombat: boolean;
  campaignsError: Error | null;
}

/**
 * Combat summary for list view (without full state snapshot)
 * Used in the combats list to display basic information without loading
 * the entire combat state which can be large.
 */
export interface CombatSummaryDTO {
  id: string;
  campaign_id: string;
  name: string;
  status: "active" | "completed";
  current_round: number;
  participant_count: number;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
}

/**
 * List combats response with pagination metadata
 */
export interface ListCombatsResponseDTO extends PaginationMetadataDTO {
  combats: CombatSummaryDTO[];
}
