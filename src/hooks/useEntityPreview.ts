import { useQuery } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase';

export type PreviewEntityType =
  | 'location'
  | 'npc'
  | 'player_character'
  | 'quest'
  | 'session'
  | 'story_arc'
  | 'story_item'
  | 'faction'
  | 'lore_note';

export interface EntityPreview {
  id: string;
  name?: string;
  title?: string;
  image_url?: string | null;
  // NPC/PC fields
  race?: string | null;
  class?: string | null;
  role?: string | null;
  factions?: { name: string } | null;
  // Quest/StoryArc fields
  status?: string | null;
  // Location fields
  location_type?: string | null;
}

export function getEntityMetadata(
  preview: EntityPreview | null | undefined,
  entityType: PreviewEntityType
): string | null {
  if (!preview) return null;

  switch (entityType) {
    case 'player_character': {
      const parts = [preview.race, preview.class].filter(Boolean);
      return parts.length > 0 ? parts.join(' ') : null;
    }

    case 'npc': {
      const parts = [preview.race, preview.role].filter(Boolean);
      if (parts.length === 0) return null;
      const base = parts.join(' ');
      return preview.factions?.name ? `${base} (${preview.factions.name})` : base;
    }

    case 'quest':
    case 'story_arc':
      return preview.status ? `Status: ${preview.status}` : null;

    case 'location':
      return preview.location_type || null;

    default:
      return null;
  }
}

export function useEntityPreview(entityType: PreviewEntityType, id: string | undefined) {
  return useQuery({
    queryKey: ['entity-preview', entityType, id],
    queryFn: async (): Promise<EntityPreview | null> => {
      if (!id) return null;
      const supabase = getSupabaseClient();

      switch (entityType) {
        case 'location':
          return supabase
            .from('locations')
            .select('id, name, location_type, image_url')
            .eq('id', id)
            .single()
            .then(({ data }) => data);

        case 'npc':
          return supabase
            .from('npcs')
            .select('id, name, race, role, faction_id, image_url, factions(name)')
            .eq('id', id)
            .single()
            .then(({ data }) => data as EntityPreview | null);

        case 'player_character':
          return supabase
            .from('player_characters')
            .select('id, name, race, class, image_url')
            .eq('id', id)
            .single()
            .then(({ data }) => data);

        case 'quest':
          return supabase
            .from('quests')
            .select('id, title, status')
            .eq('id', id)
            .single()
            .then(({ data }) => data);

        case 'session':
          return supabase
            .from('sessions')
            .select('id, title')
            .eq('id', id)
            .single()
            .then(({ data }) => data);

        case 'story_arc':
          return supabase
            .from('story_arcs')
            .select('id, title, status')
            .eq('id', id)
            .single()
            .then(({ data }) => data);

        case 'story_item':
          return supabase
            .from('story_items')
            .select('id, name, image_url')
            .eq('id', id)
            .single()
            .then(({ data }) => data);

        case 'faction':
          return supabase
            .from('factions')
            .select('id, name')
            .eq('id', id)
            .single()
            .then(({ data }) => data);

        case 'lore_note':
          return supabase
            .from('lore_notes')
            .select('id, title')
            .eq('id', id)
            .single()
            .then(({ data }) => data);

        default:
          return null;
      }
    },
    enabled: !!id && !!entityType,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export const ENTITY_ROUTE_MAP: Record<PreviewEntityType, string> = {
  location: 'locations',
  npc: 'npcs',
  player_character: 'characters',
  quest: 'quests',
  session: 'sessions',
  story_arc: 'story-arcs',
  story_item: 'story-items',
  faction: 'factions',
  lore_note: 'lore-notes',
};
