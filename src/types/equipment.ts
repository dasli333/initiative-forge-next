// Equipment type definitions
// Equipment data stored as JSONB in database (similar to spells)

import type { PaginationMetadataDTO } from "@/types";

/**
 * Equipment data DTO
 * This is the typed version of the 'data' JSONB field in equipment table
 * Supports all D&D equipment types: weapons, armor, tools, adventuring gear, etc.
 */
export interface EquipmentDataDTO {
  /** Equipment ID for reference */
  id: string;

  /** Localized name */
  name: {
    en: string;
    pl: string;
  };

  /** Equipment categories (e.g., "Weapons", "Armor", "Adventuring Gear") */
  equipment_categories: Array<{
    id: string;
    name: string;
  }>;

  /** Cost in various currency units (gp, sp, cp) */
  cost?: {
    quantity: number;
    unit: string;
  };

  /** Weight in pounds */
  weight?: number;

  /** Description text */
  description?: string;

  /** Optional image path */
  image?: string;

  // ============================================================================
  // ARMOR-SPECIFIC FIELDS
  // ============================================================================

  /** Armor class calculation */
  armor_class?: {
    base: number;
    dex_bonus: boolean;
    max_bonus?: number;
  };

  /** Time to don armor */
  don_time?: string;

  /** Time to doff armor */
  doff_time?: string;

  /** Whether armor imposes disadvantage on Stealth */
  stealth_disadvantage?: boolean;

  /** Minimum Strength requirement */
  str_minimum?: number;

  // ============================================================================
  // WEAPON-SPECIFIC FIELDS
  // ============================================================================

  /** Primary damage (one-handed for versatile weapons) */
  damage?: {
    formula: string;
    damageType: string;
  };

  /** Two-handed damage (for versatile weapons) */
  two_handed_damage?: {
    formula: string;
    damageType: string;
  };

  /** Melee weapon range */
  range?: {
    normal: number;
    long?: number;
  };

  /** Thrown weapon range */
  throw_range?: {
    normal: number;
    long: number;
  };

  /** Weapon properties (e.g., "Finesse", "Light", "Versatile") */
  properties?: Array<{
    id: string;
    name: string;
  }>;

  /** Weapon mastery property */
  mastery?: {
    id: string;
    name: string;
  };

  /** Required ammunition type */
  ammunition?: {
    id: string;
    name: string;
  };

  // ============================================================================
  // TOOL-SPECIFIC FIELDS
  // ============================================================================

  /** Ability used with this tool */
  ability?: {
    id: string;
    name: string;
  };

  /** Items that can be crafted with this tool */
  craft?: Array<{
    id: string;
    name: string;
  }>;

  /** Utility actions with DC checks */
  utilize?: Array<{
    name: string;
    dc: {
      dc_type: {
        id: string;
        name: string;
      };
      dc_value: number;
      success_type: string;
    };
  }>;

  // ============================================================================
  // CONTAINER/PACK-SPECIFIC FIELDS
  // ============================================================================

  /** Contents of equipment packs */
  contents?: Array<{
    item: {
      id: string;
      name: string;
    };
    quantity: number;
  }>;

  // ============================================================================
  // AMMUNITION-SPECIFIC FIELDS
  // ============================================================================

  /** Quantity in bundle (e.g., 20 arrows) */
  quantity?: number;

  /** Storage container for ammunition */
  storage?: {
    id: string;
    name: string;
  };
}

/**
 * Equipment DTO with typed data field
 */
export interface EquipmentDTO {
  id: string;
  name: string;
  data: EquipmentDataDTO;
  created_at: string;
}

/**
 * List equipment response with pagination
 */
export interface ListEquipmentResponseDTO extends PaginationMetadataDTO {
  equipment: EquipmentDTO[];
}
