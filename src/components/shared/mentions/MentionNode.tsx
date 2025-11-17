'use client';

import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  MapPin,
  User,
  Target,
  Calendar,
  BookOpen,
  Package,
  Users,
  FileText,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase';

const ENTITY_ICONS = {
  location: MapPin,
  npc: User,
  player_character: User,
  quest: Target,
  session: Calendar,
  story_arc: BookOpen,
  story_item: Package,
  faction: Users,
  lore_note: FileText,
};

const ENTITY_COLORS = {
  location: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-300',
  npc: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300',
  player_character: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 dark:bg-cyan-900 dark:text-cyan-300',
  quest: 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-300',
  session: 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300',
  story_arc: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300',
  story_item: 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300',
  faction: 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300',
  lore_note: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300',
};

const ENTITY_ROUTE_MAP = {
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

// Generate metadata text based on entity type and data
function getEntityMetadata(
  preview: Record<string, unknown>,
  entityType: string
): string | null {
  switch (entityType) {
    case 'player_character': {
      const race = preview.race as string | null;
      const charClass = preview.class as string | null;
      const parts = [race, charClass].filter(Boolean);
      return parts.length > 0 ? parts.join(' ') : null;
    }

    case 'npc': {
      const race = preview.race as string | null;
      const role = preview.role as string | null;
      const factions = preview.factions as { name: string } | null;
      const parts = [race, role].filter(Boolean);
      if (parts.length === 0) return null;
      const base = parts.join(' ');
      return factions?.name ? `${base} (${factions.name})` : base;
    }

    case 'quest':
      return preview.status ? 'Status: ' + String(preview.status) : null;

    case 'story_arc':
      return preview.status ? 'Status: ' + String(preview.status) : null;

    case 'location':
      return preview.location_type ? String(preview.location_type) : null;

    default:
      return null;
  }
}

export function MentionNode(props: NodeViewProps) {
  const router = useRouter();
  const { id, label, entityType = 'location' } = props.node.attrs as {
    id: string;
    label: string;
    entityType?:
      | 'location'
      | 'npc'
      | 'player_character'
      | 'quest'
      | 'session'
      | 'story_arc'
      | 'story_item'
      | 'faction'
      | 'lore_note';
  };
  const campaignId = props.extension.storage.campaignId as string | undefined;

  // Fallback to location if entityType is invalid
  const validEntityType = entityType && entityType in ENTITY_ICONS ? entityType : 'location';
  const Icon = ENTITY_ICONS[validEntityType];
  const colorClass = ENTITY_COLORS[validEntityType];

  // Fetch entity preview for HoverCard (300ms delay handled by HoverCard)
  const { data: preview } = useQuery({
    queryKey: ['entity-preview', validEntityType, id],
    queryFn: async () => {
      const supabase = getSupabaseClient();

      // Fetch based on entity type with specific fields
      switch (validEntityType) {
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
            .then(({ data }) => data);

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
            .select('id, name, plan_json')
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
            .select('id, name, description_json, image_url')
            .eq('id', id)
            .single()
            .then(({ data }) => data);

        case 'faction':
          return supabase
            .from('factions')
            .select('id, name, description_json')
            .eq('id', id)
            .single()
            .then(({ data }) => data);

        case 'lore_note':
          return supabase
            .from('lore_notes')
            .select('id, title, content_json')
            .eq('id', id)
            .single()
            .then(({ data }) => data);

        default:
          return null;
      }
    },
    enabled: !!id && !!validEntityType,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!campaignId) return;

    const route = ENTITY_ROUTE_MAP[validEntityType];
    router.push(`/campaigns/${campaignId}/${route}?selectedId=${id}`);
  };

  return (
    <NodeViewWrapper as="span" className="inline">
      <HoverCard openDelay={300}>
        <HoverCardTrigger asChild>
          <button
            type="button"
            onClick={handleClick}
            className={cn(
              'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-sm font-medium transition-colors cursor-pointer',
              colorClass
            )}
            data-mention
            data-id={id}
            data-type={validEntityType}
          >
            <Icon className="h-3 w-3" />
            <span>{label}</span>
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={cn('rounded-full p-2', colorClass)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold truncate">{label}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {validEntityType.replace('_', ' ')}
                </p>
              </div>
            </div>
            {preview && getEntityMetadata(preview, validEntityType) && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>{getEntityMetadata(preview, validEntityType)}</p>
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    </NodeViewWrapper>
  );
}
