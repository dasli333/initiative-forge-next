'use client';

import { useMentionsOfQuery } from '@/hooks/useEntityMentions';
import { useQuery } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin, User, Target, Calendar, BookOpen, Package, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface BacklinksSectionProps {
  locationId: string;
  campaignId: string;
}

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
  location: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  npc: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  player_character: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
  quest: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  session: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  story_arc: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  story_item: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  faction: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  lore_note: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
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

interface BacklinkWithDetails {
  id: string;
  source_type: string;
  source_id: string;
  source_name: string;
}

export function BacklinksSection({ locationId, campaignId }: BacklinksSectionProps) {
  const router = useRouter();

  // Fetch mentions where this location is mentioned
  const { data: mentions, isLoading: mentionsLoading } = useMentionsOfQuery('location', locationId);

  // Fetch source entity details for all mentions
  const { data: backlinks, isLoading: backlinksLoading } = useQuery({
    queryKey: ['backlinks-details', locationId, mentions],
    queryFn: async () => {
      if (!mentions || mentions.length === 0) return [];

      const supabase = getSupabaseClient();
      const results: BacklinkWithDetails[] = [];

      // Group mentions by source type for efficient querying
      const mentionsByType = mentions.reduce((acc, mention) => {
        if (!acc[mention.source_type]) {
          acc[mention.source_type] = [];
        }
        acc[mention.source_type].push(mention.source_id);
        return acc;
      }, {} as Record<string, string[]>);

      // Fetch each entity type in parallel
      await Promise.all(
        Object.entries(mentionsByType).map(async ([sourceType, sourceIds]) => {
          try {
            switch (sourceType) {
              case 'location': {
                const { data } = await supabase
                  .from('locations')
                  .select('id, name')
                  .in('id', sourceIds);
                if (data) {
                  results.push(
                    ...data.map((loc) => ({
                      id: loc.id,
                      source_type: sourceType,
                      source_id: loc.id,
                      source_name: loc.name,
                    }))
                  );
                }
                break;
              }
              case 'npc': {
                const { data } = await supabase
                  .from('npcs')
                  .select('id, name')
                  .in('id', sourceIds);
                if (data) {
                  results.push(
                    ...data.map((npc) => ({
                      id: npc.id,
                      source_type: sourceType,
                      source_id: npc.id,
                      source_name: npc.name,
                    }))
                  );
                }
                break;
              }
              case 'player_character': {
                const { data } = await supabase
                  .from('player_characters')
                  .select('id, name')
                  .in('id', sourceIds);
                if (data) {
                  results.push(
                    ...data.map((pc) => ({
                      id: pc.id,
                      source_type: sourceType,
                      source_id: pc.id,
                      source_name: pc.name,
                    }))
                  );
                }
                break;
              }
              case 'quest': {
                const { data } = await supabase
                  .from('quests')
                  .select('id, title')
                  .in('id', sourceIds);
                if (data) {
                  results.push(
                    ...data.map((quest) => ({
                      id: quest.id,
                      source_type: sourceType,
                      source_id: quest.id,
                      source_name: quest.title,
                    }))
                  );
                }
                break;
              }
              case 'session': {
                const { data } = await supabase
                  .from('sessions')
                  .select('id, session_number')
                  .in('id', sourceIds);
                if (data) {
                  results.push(
                    ...data.map((session) => ({
                      id: session.id,
                      source_type: sourceType,
                      source_id: session.id,
                      source_name: `Session #${session.session_number}`,
                    }))
                  );
                }
                break;
              }
              case 'story_arc': {
                const { data } = await supabase
                  .from('story_arcs')
                  .select('id, title')
                  .in('id', sourceIds);
                if (data) {
                  results.push(
                    ...data.map((arc) => ({
                      id: arc.id,
                      source_type: sourceType,
                      source_id: arc.id,
                      source_name: arc.title,
                    }))
                  );
                }
                break;
              }
              case 'story_item': {
                const { data } = await supabase
                  .from('story_items')
                  .select('id, name')
                  .in('id', sourceIds);
                if (data) {
                  results.push(
                    ...data.map((item) => ({
                      id: item.id,
                      source_type: sourceType,
                      source_id: item.id,
                      source_name: item.name,
                    }))
                  );
                }
                break;
              }
              case 'faction': {
                const { data } = await supabase
                  .from('factions')
                  .select('id, name')
                  .in('id', sourceIds);
                if (data) {
                  results.push(
                    ...data.map((faction) => ({
                      id: faction.id,
                      source_type: sourceType,
                      source_id: faction.id,
                      source_name: faction.name,
                    }))
                  );
                }
                break;
              }
              case 'lore_note': {
                const { data } = await supabase
                  .from('lore_notes')
                  .select('id, title')
                  .in('id', sourceIds);
                if (data) {
                  results.push(
                    ...data.map((note) => ({
                      id: note.id,
                      source_type: sourceType,
                      source_id: note.id,
                      source_name: note.title,
                    }))
                  );
                }
                break;
              }
            }
          } catch (error) {
            console.error(`Failed to fetch ${sourceType} details:`, error);
          }
        })
      );

      return results;
    },
    enabled: !!mentions && mentions.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleBacklinkClick = (backlink: BacklinkWithDetails) => {
    const route = ENTITY_ROUTE_MAP[backlink.source_type as keyof typeof ENTITY_ROUTE_MAP];
    if (route) {
      router.push(`/campaigns/${campaignId}/${route}?selectedId=${backlink.source_id}`);
    }
  };

  const isLoading = mentionsLoading || backlinksLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mentioned In</CardTitle>
        <CardDescription>
          Other entities that reference this location
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : !backlinks || backlinks.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
            No mentions yet. Use @mentions in other entities to reference this location.
          </p>
        ) : (
          <div className="space-y-2">
            {backlinks.map((backlink) => {
              const Icon = ENTITY_ICONS[backlink.source_type as keyof typeof ENTITY_ICONS];
              const colorClass = ENTITY_COLORS[backlink.source_type as keyof typeof ENTITY_COLORS];

              return (
                <button
                  key={backlink.id}
                  onClick={() => handleBacklinkClick(backlink)}
                  className={cn(
                    'flex items-center gap-2 w-full p-3 rounded-lg border transition-colors text-left',
                    'hover:bg-gray-50 dark:hover:bg-gray-900'
                  )}
                >
                  <div className={cn('rounded-full p-2', colorClass)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{backlink.source_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {backlink.source_type.replace('_', ' ')}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
