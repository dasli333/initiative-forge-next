import type { Tables } from '@/types/database';

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type NPCTag = Tables<'npc_tags'>;
export type NPCTagAssignment = Tables<'npc_tag_assignments'>;

/**
 * NPC Tag DTO (no Json fields, direct mapping)
 */
export type NPCTagDTO = NPCTag;

// ============================================================================
// COMMAND MODELS
// ============================================================================

/**
 * Create NPC Tag command
 * campaign_id is passed separately in API function
 */
export interface CreateNPCTagCommand {
  name: string;
  color: string; // hex or tailwind color (e.g., 'emerald', 'red')
  icon: string; // lucide-react icon name (e.g., 'Sword', 'Heart')
}

/**
 * Update NPC Tag command
 * All fields optional for partial updates
 */
export interface UpdateNPCTagCommand {
  name?: string;
  color?: string;
  icon?: string;
}

/**
 * Assign tag to NPC command
 */
export interface AssignTagToNPCCommand {
  npc_id: string;
  tag_id: string;
}

/**
 * Unassign tag from NPC command
 */
export interface UnassignTagFromNPCCommand {
  npc_id: string;
  tag_id: string;
}

// ============================================================================
// PREDEFINED TAG PRESETS
// ============================================================================

/**
 * Suggested tag presets for campaign initialization
 */
export const TAG_PRESETS = [
  { name: 'Ally', color: 'emerald', icon: 'Heart' },
  { name: 'Enemy', color: 'red', icon: 'Sword' },
  { name: 'Important', color: 'amber', icon: 'Star' },
  { name: 'Quest Giver', color: 'blue', icon: 'Scroll' },
  { name: 'Merchant', color: 'purple', icon: 'Coins' },
  { name: 'Neutral', color: 'gray', icon: 'User' },
] as const;

/**
 * Available colors for tags (Tailwind colors)
 */
export const TAG_COLORS = [
  'slate',
  'gray',
  'zinc',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
] as const;

/**
 * Available icons for tags (lucide-react icon names)
 */
export const TAG_ICONS = [
  'Sword',
  'Heart',
  'Star',
  'Scroll',
  'Coins',
  'User',
  'Users',
  'Crown',
  'Shield',
  'Zap',
  'Skull',
  'Target',
  'Flag',
  'Book',
  'Map',
  'Lock',
  'Key',
  'Gift',
  'MessageCircle',
  'Eye',
] as const;

export type TagColor = (typeof TAG_COLORS)[number];
export type TagIcon = (typeof TAG_ICONS)[number];
