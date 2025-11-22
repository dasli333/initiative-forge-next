import type { Tables } from '@/types/database';

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type LoreNoteTag = Tables<'lore_note_tags'>;
export type LoreNoteTagAssignment = Tables<'lore_note_tag_assignments'>;

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Available icons for lore note tags (lucide-react icon names)
 */
export const TAG_ICONS = [
  'BookOpen',
  'Scroll',
  'Sparkles',
  'Crown',
  'Skull',
  'Swords',
  'Castle',
  'MapPin',
  'Globe',
  'Moon',
  'Sun',
  'Star',
  'Zap',
  'Flame',
  'Droplet',
  'Leaf',
  'Mountain',
  'Eye',
  'Lock',
  'Key',
] as const;

export type TagIcon = (typeof TAG_ICONS)[number];

/**
 * Lore Note Tag DTO with typed icon field
 */
export type LoreNoteTagDTO = Omit<LoreNoteTag, 'icon'> & {
  icon: TagIcon;
};

// ============================================================================
// COMMAND MODELS
// ============================================================================

/**
 * Create Lore Note Tag command
 * campaign_id is passed separately in API function
 */
export interface CreateLoreNoteTagCommand {
  name: string;
  color: string; // hex or tailwind color (e.g., 'emerald', 'red')
  icon: TagIcon; // lucide-react icon name (e.g., 'BookOpen', 'Scroll')
}

/**
 * Update Lore Note Tag command
 * All fields optional for partial updates
 */
export interface UpdateLoreNoteTagCommand {
  name?: string;
  color?: string;
  icon?: TagIcon;
}

/**
 * Assign tag to lore note command
 */
export interface AssignTagToLoreNoteCommand {
  lore_note_id: string;
  tag_id: string;
}

/**
 * Unassign tag from lore note command
 */
export interface UnassignTagFromLoreNoteCommand {
  lore_note_id: string;
  tag_id: string;
}

// ============================================================================
// PREDEFINED TAG PRESETS
// ============================================================================

/**
 * Suggested tag presets for campaign initialization
 */
export const TAG_PRESETS = [
  { name: 'Prophecy', color: 'purple', icon: 'Sparkles' },
  { name: 'Ancient', color: 'amber', icon: 'Scroll' },
  { name: 'Secret', color: 'slate', icon: 'Lock' },
  { name: 'Rumor', color: 'sky', icon: 'Eye' },
  { name: 'Fact', color: 'emerald', icon: 'BookOpen' },
  { name: 'Legend', color: 'orange', icon: 'Crown' },
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

export type TagColor = (typeof TAG_COLORS)[number];
