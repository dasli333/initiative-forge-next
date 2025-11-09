import { getSupabaseClient } from '@/lib/supabase';
import Fuse from 'fuse.js';

interface TiptapNode {
  type?: string;
  text?: string;
  content?: TiptapNode[];
  [key: string]: unknown;
}

export interface EntitySearchResult {
  id: string;
  label: string;
  entityType:
    | 'location'
    | 'npc'
    | 'player_character'
    | 'quest'
    | 'session'
    | 'story_arc'
    | 'story_item'
    | 'faction'
    | 'lore_note';
  imageUrl?: string | null;
  excerpt?: string | null;
}

/**
 * Search all campaign entities for @mentions autocomplete
 * @param campaignId - Campaign ID
 * @param query - Search query
 * @returns Array of matching entities
 */
export async function searchCampaignEntities(
  campaignId: string,
  query: string
): Promise<EntitySearchResult[]> {
  const supabase = getSupabaseClient();

  // Fetch all entity types in parallel
  const [
    locationsRes,
    npcsRes,
    playerCharactersRes,
    questsRes,
    sessionsRes,
    storyArcsRes,
    storyItemsRes,
    factionsRes,
    loreNotesRes,
  ] = await Promise.all([
    supabase
      .from('locations')
      .select('id, name, image_url, description_json')
      .eq('campaign_id', campaignId),
    supabase
      .from('npcs')
      .select('id, name, image_url, biography_json')
      .eq('campaign_id', campaignId),
    supabase
      .from('player_characters')
      .select('id, name, image_url, class, level')
      .eq('campaign_id', campaignId),
    supabase
      .from('quests')
      .select('id, title, description_json')
      .eq('campaign_id', campaignId),
    supabase
      .from('sessions')
      .select('id, session_number, plan_json')
      .eq('campaign_id', campaignId),
    supabase
      .from('story_arcs')
      .select('id, title, description_json')
      .eq('campaign_id', campaignId),
    supabase
      .from('story_items')
      .select('id, name, image_url, description_json')
      .eq('campaign_id', campaignId),
    supabase
      .from('factions')
      .select('id, name, description_json')
      .eq('campaign_id', campaignId),
    supabase
      .from('lore_notes')
      .select('id, title, content_json')
      .eq('campaign_id', campaignId),
  ]);

  // Handle errors
  if (locationsRes.error) throw locationsRes.error;
  if (npcsRes.error) throw npcsRes.error;
  if (playerCharactersRes.error) throw playerCharactersRes.error;
  if (questsRes.error) throw questsRes.error;
  if (sessionsRes.error) throw sessionsRes.error;
  if (storyArcsRes.error) throw storyArcsRes.error;
  if (storyItemsRes.error) throw storyItemsRes.error;
  if (factionsRes.error) throw factionsRes.error;
  if (loreNotesRes.error) throw loreNotesRes.error;

  // Transform to EntitySearchResult format
  const allEntities: EntitySearchResult[] = [
    ...(locationsRes.data || []).map((loc) => ({
      id: loc.id,
      label: loc.name,
      entityType: 'location' as const,
      imageUrl: loc.image_url,
      excerpt: extractExcerpt(loc.description_json as TiptapNode | null),
    })),
    ...(npcsRes.data || []).map((npc) => ({
      id: npc.id,
      label: npc.name,
      entityType: 'npc' as const,
      imageUrl: npc.image_url,
      excerpt: extractExcerpt(npc.biography_json as TiptapNode | null),
    })),
    ...(playerCharactersRes.data || []).map((pc: any) => ({
      id: pc.id,
      label: pc.name,
      entityType: 'player_character' as const,
      imageUrl: pc.image_url,
      excerpt: pc.level && pc.class ? `Level ${pc.level} ${pc.class}` : pc.class || null,
    })),
    ...(questsRes.data || []).map((quest) => ({
      id: quest.id,
      label: quest.title,
      entityType: 'quest' as const,
      imageUrl: null,
      excerpt: extractExcerpt(quest.description_json as TiptapNode | null),
    })),
    ...(sessionsRes.data || []).map((session) => ({
      id: session.id,
      label: `Session #${session.session_number}`,
      entityType: 'session' as const,
      imageUrl: null,
      excerpt: extractExcerpt(session.plan_json as TiptapNode | null),
    })),
    ...(storyArcsRes.data || []).map((arc) => ({
      id: arc.id,
      label: arc.title,
      entityType: 'story_arc' as const,
      imageUrl: null,
      excerpt: extractExcerpt(arc.description_json as TiptapNode | null),
    })),
    ...(storyItemsRes.data || []).map((item) => ({
      id: item.id,
      label: item.name,
      entityType: 'story_item' as const,
      imageUrl: item.image_url,
      excerpt: extractExcerpt(item.description_json as TiptapNode | null),
    })),
    ...(factionsRes.data || []).map((faction) => ({
      id: faction.id,
      label: faction.name,
      entityType: 'faction' as const,
      imageUrl: null,
      excerpt: extractExcerpt(faction.description_json as TiptapNode | null),
    })),
    ...(loreNotesRes.data || []).map((note) => ({
      id: note.id,
      label: note.title,
      entityType: 'lore_note' as const,
      imageUrl: null,
      excerpt: extractExcerpt(note.content_json as TiptapNode | null),
    })),
  ];

  // Fuzzy search with fuse.js
  if (!query || query.trim() === '') {
    return allEntities.slice(0, 10); // Return first 10 if no query
  }

  const fuse = new Fuse(allEntities, {
    keys: ['label'],
    threshold: 0.3, // 0 = exact match, 1 = match anything
    ignoreLocation: true,
  });

  const results = fuse.search(query);
  return results.slice(0, 10).map((result) => result.item);
}

/**
 * Extract first 100 characters of text from Tiptap JSON
 */
function extractExcerpt(json: TiptapNode | null): string | null {
  if (!json || typeof json !== 'object') return null;

  let text = '';

  const extractText = (node: TiptapNode): void => {
    if (node.text) {
      text += node.text;
    }
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(extractText);
    }
  };

  extractText(json);

  return text.trim().slice(0, 100) || null;
}
