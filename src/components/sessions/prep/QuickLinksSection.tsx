'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Plus, X, Search, MapPin, User, ScrollText, Landmark, BookOpen, Gem, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { searchCampaignEntities, type EntitySearchResult } from '@/lib/api/entities';
import type { PinnedEntity, PinnedEntityType } from '@/types/sessions';

interface QuickLinksSectionProps {
  pinnedEntities: PinnedEntity[];
  isEditing: boolean;
  onChange: (pinnedEntities: PinnedEntity[]) => void;
  campaignId: string;
}

const entityTypeConfig: Record<PinnedEntityType, { icon: typeof MapPin; className: string }> = {
  location: { icon: MapPin, className: 'bg-green-100 text-green-700 border-green-300' },
  npc: { icon: User, className: 'bg-blue-100 text-blue-700 border-blue-300' },
  player_character: { icon: User, className: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  quest: { icon: ScrollText, className: 'bg-purple-100 text-purple-700 border-purple-300' },
  story_arc: { icon: BookOpen, className: 'bg-amber-100 text-amber-700 border-amber-300' },
  story_item: { icon: Gem, className: 'bg-pink-100 text-pink-700 border-pink-300' },
  faction: { icon: Users, className: 'bg-orange-100 text-orange-700 border-orange-300' },
  lore_note: { icon: FileText, className: 'bg-slate-100 text-slate-700 border-slate-300' },
};

export function QuickLinksSection({
  pinnedEntities,
  isEditing,
  onChange,
  campaignId,
}: QuickLinksSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Search entities
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['entity-search', campaignId, searchQuery],
    queryFn: () => searchCampaignEntities(campaignId, searchQuery),
    enabled: isOpen && searchQuery.length > 0,
  });

  // Filter out already pinned entities and sessions (can't pin sessions)
  const filteredResults = searchResults.filter(
    (result) =>
      result.entityType !== 'session' &&
      !pinnedEntities.some((pinned) => pinned.id === result.id)
  );

  const handleAddEntity = (result: EntitySearchResult) => {
    if (result.entityType === 'session') return; // Skip sessions

    const newPinned: PinnedEntity = {
      id: result.id,
      type: result.entityType as PinnedEntityType,
      name: result.label,
    };

    onChange([...pinnedEntities, newPinned]);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleRemoveEntity = (id: string) => {
    onChange(pinnedEntities.filter((entity) => entity.id !== id));
  };

  return (
    <section className="space-y-3">
      <div>
        <Label className="text-base font-semibold">Quick Links</Label>
        <p className="text-xs text-muted-foreground">
          Pin entities for quick access during the session
        </p>
      </div>

      {/* Pinned entities */}
      <div className="flex flex-wrap gap-2">
        {pinnedEntities.length === 0 && !isEditing && (
          <p className="text-sm text-muted-foreground italic py-2">
            No entities pinned
          </p>
        )}

        {pinnedEntities.map((entity) => {
          const config = entityTypeConfig[entity.type];
          const Icon = config.icon;

          return (
            <Badge
              key={entity.id}
              variant="outline"
              className={cn('flex items-center gap-1 px-2 py-1', config.className)}
            >
              <Icon className="h-3 w-3" />
              <span>{entity.name}</span>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => handleRemoveEntity(entity.id)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          );
        })}

        {/* Add button */}
        {isEditing && pinnedEntities.length < 20 && (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-7">
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-2" align="start">
              {/* Search input */}
              <div className="relative mb-2">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search entities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                  autoFocus
                />
              </div>

              {/* Results */}
              <div className="max-h-60 overflow-y-auto">
                {searchQuery.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Type to search for entities
                  </p>
                )}

                {isLoading && searchQuery.length > 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Searching...
                  </p>
                )}

                {!isLoading && searchQuery.length > 0 && filteredResults.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No results found
                  </p>
                )}

                {filteredResults.map((result) => {
                  const config = entityTypeConfig[result.entityType as PinnedEntityType];
                  if (!config) return null;
                  const Icon = config.icon;

                  return (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => handleAddEntity(result)}
                      className="w-full flex items-center gap-2 p-2 text-left text-sm rounded-md hover:bg-accent"
                    >
                      <Badge variant="outline" className={cn('shrink-0', config.className)}>
                        <Icon className="h-3 w-3" />
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{result.label}</div>
                        {result.excerpt && (
                          <div className="text-xs text-muted-foreground truncate">
                            {result.excerpt}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {isEditing && pinnedEntities.length >= 20 && (
          <span className="text-xs text-muted-foreground">
            Maximum 20 entities
          </span>
        )}
      </div>
    </section>
  );
}
