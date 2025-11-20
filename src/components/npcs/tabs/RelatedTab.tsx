'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, User, Target, Calendar, BookOpen, Package, Users, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMentionsOf, enrichMentionsWithNames } from '@/lib/api/entity-mentions';
import { formatFieldName } from '@/lib/utils/mentionUtils';
import type { PCRelationshipViewModel } from '@/types/npcs';

interface RelatedTabProps {
  npcId: string;
  pcRelationships?: PCRelationshipViewModel[];
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

/**
 * Related tab for NPC details
 * Shows PC relationships and backlinks ("Mentioned In") sections
 */
export function RelatedTab({ npcId, pcRelationships, campaignId }: RelatedTabProps) {
  const router = useRouter();

  // Query for backlinks (entities mentioning this NPC)
  const { data: backlinks = [], isLoading } = useQuery({
    queryKey: ['entity-mentions', 'npc', npcId],
    queryFn: async () => {
      const mentions = await getMentionsOf('npc', npcId);
      return enrichMentionsWithNames(mentions);
    },
    enabled: !!npcId,
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

  const handlePCClick = (pcId: string) => {
    router.push(`/campaigns/${campaignId}/characters?selectedId=${pcId}`);
  };

  return (
    <div className="space-y-6">
      {/* Player Characters Section */}
      {pcRelationships && pcRelationships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Player Characters</CardTitle>
            <CardDescription>
              Player characters related to this NPC
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pcRelationships.map((rel) => (
                <button
                  key={rel.id}
                  onClick={() => handlePCClick(rel.player_character_id)}
                  className={cn(
                    'flex items-center gap-3 w-full p-3 rounded-lg border transition-colors text-left',
                    'hover:bg-muted'
                  )}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {rel.player_character_image_url ? (
                      <Image
                        src={rel.player_character_image_url}
                        alt={rel.player_character_name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{rel.player_character_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {rel.relationship_type}
                    </p>
                    {rel.description && (
                      <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                        {rel.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mentioned In Section */}
      <Card>
        <CardHeader>
          <CardTitle>Mentioned In</CardTitle>
          <CardDescription>
            Other entities that reference this NPC
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : groupedBacklinks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No mentions yet. Use @mentions in other entities to reference this NPC.
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
