'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, User, Target, Calendar, BookOpen, Package, Users, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMentionsOf, enrichMentionsWithNames } from '@/lib/api/entity-mentions';
import { formatFieldName } from '@/lib/utils/mentionUtils';

interface RelatedTabProps {
  characterId: string;
  campaignId: string;
}

const ENTITY_ICONS = {
  location: MapPin,
  npc: User,
  quest: Target,
  session: Calendar,
  story_arc: BookOpen,
  story_item: Package,
  faction: Users,
  lore_note: FileText,
  player_character: User,
};

const ENTITY_COLORS = {
  location: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  npc: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  quest: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  session: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  story_arc: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  story_item: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  faction: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  lore_note: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
  player_character: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
};

const ENTITY_ROUTE_MAP = {
  location: 'locations',
  npc: 'npcs',
  quest: 'quests',
  session: 'sessions',
  story_arc: 'story-arcs',
  story_item: 'story-items',
  faction: 'factions',
  lore_note: 'lore-notes',
  player_character: 'characters',
};

/**
 * Related tab for Player Character details
 * Shows "Mentioned In" section - list of entities mentioning this PC
 */
export function RelatedTab({ characterId, campaignId }: RelatedTabProps) {
  const router = useRouter();

  // Query for backlinks (entities mentioning this player character)
  const { data: backlinks = [], isLoading } = useQuery({
    queryKey: ['entity-mentions', 'player_character', characterId],
    queryFn: async () => {
      const mentions = await getMentionsOf('player_character', characterId);
      return enrichMentionsWithNames(mentions);
    },
    enabled: !!characterId,
  });

  // Group backlinks by source entity and collect unique fields
  const groupedBacklinks = useMemo(() => {
    const groups = new Map<string, {
      source_type: string;
      source_id: string;
      source_name?: string;
      fields: Set<string>;
    }>();

    backlinks.forEach((backlink) => {
      const key = `${backlink.source_type}-${backlink.source_id}`;
      const existing = groups.get(key);

      if (existing) {
        existing.fields.add(backlink.source_field);
      } else {
        groups.set(key, {
          source_type: backlink.source_type,
          source_id: backlink.source_id,
          source_name: backlink.source_name,
          fields: new Set([backlink.source_field]),
        });
      }
    });

    return Array.from(groups.values());
  }, [backlinks]);

  const handleBacklinkClick = (backlink: { source_type: string; source_id: string }) => {
    const route = ENTITY_ROUTE_MAP[backlink.source_type as keyof typeof ENTITY_ROUTE_MAP];
    if (route) {
      router.push(`/campaigns/${campaignId}/${route}?selectedId=${backlink.source_id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mentioned In Section */}
      <Card>
        <CardHeader>
          <CardTitle>Mentioned In</CardTitle>
          <CardDescription>
            Other entities that reference this player character
          </CardDescription>
        </CardHeader>
        <CardContent>
          {groupedBacklinks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No mentions yet. Use @mentions in other entities to reference this character.
            </p>
          ) : (
            <div className="space-y-2">
              {groupedBacklinks.map((backlink) => {
                const Icon = ENTITY_ICONS[backlink.source_type as keyof typeof ENTITY_ICONS] || FileText;
                const colorClass = ENTITY_COLORS[backlink.source_type as keyof typeof ENTITY_COLORS] || ENTITY_COLORS.lore_note;
                const fieldsArray = Array.from(backlink.fields).map(formatFieldName);
                const fieldsLabel = fieldsArray.length === 1 ? 'Field' : 'Fields';

                return (
                  <button
                    key={`${backlink.source_type}-${backlink.source_id}`}
                    onClick={() => handleBacklinkClick(backlink)}
                    className={cn(
                      'flex items-center gap-2 w-full p-3 rounded-lg border transition-colors text-left',
                      'hover:bg-muted'
                    )}
                  >
                    <div className={cn('rounded-full p-2', colorClass)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {backlink.source_name || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate capitalize">
                        {backlink.source_type.replace('_', ' ')} · {fieldsLabel}: {fieldsArray.join(', ')}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
