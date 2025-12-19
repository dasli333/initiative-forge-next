'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Input } from '@/components/ui/input';
import { Plus, X, Search, MapPin, User, ScrollText, BookOpen, Gem, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { searchCampaignEntities, type EntitySearchResult } from '@/lib/api/entities';
import type { PinnedEntity, PinnedEntityType } from '@/types/sessions';
import {
  useEntityPreview,
  getEntityMetadata,
  ENTITY_ROUTE_MAP,
  type PreviewEntityType,
} from '@/hooks/useEntityPreview';
import { SectionCard } from '../shared/SectionCard';

interface QuickLinksSectionProps {
  pinnedEntities: PinnedEntity[];
  isEditing: boolean;
  onChange: (pinnedEntities: PinnedEntity[]) => void;
  campaignId: string;
}

const entityTypeConfig: Record<PinnedEntityType, { icon: typeof MapPin; className: string; hoverClassName: string }> = {
  location: { icon: MapPin, className: 'bg-green-100 text-green-700 border-green-300', hoverClassName: 'hover:bg-green-200' },
  npc: { icon: User, className: 'bg-blue-100 text-blue-700 border-blue-300', hoverClassName: 'hover:bg-blue-200' },
  player_character: { icon: User, className: 'bg-indigo-100 text-indigo-700 border-indigo-300', hoverClassName: 'hover:bg-indigo-200' },
  quest: { icon: ScrollText, className: 'bg-purple-100 text-purple-700 border-purple-300', hoverClassName: 'hover:bg-purple-200' },
  story_arc: { icon: BookOpen, className: 'bg-amber-100 text-amber-700 border-amber-300', hoverClassName: 'hover:bg-amber-200' },
  story_item: { icon: Gem, className: 'bg-pink-100 text-pink-700 border-pink-300', hoverClassName: 'hover:bg-pink-200' },
  faction: { icon: Users, className: 'bg-orange-100 text-orange-700 border-orange-300', hoverClassName: 'hover:bg-orange-200' },
  lore_note: { icon: FileText, className: 'bg-slate-100 text-slate-700 border-slate-300', hoverClassName: 'hover:bg-slate-200' },
};

interface PinnedEntityBadgeProps {
  entity: PinnedEntity;
  campaignId: string;
  isEditing: boolean;
  onRemove: (id: string) => void;
}

function PinnedEntityBadge({ entity, campaignId, isEditing, onRemove }: PinnedEntityBadgeProps) {
  const config = entityTypeConfig[entity.type];
  const Icon = config.icon;
  const { data: preview } = useEntityPreview(entity.type as PreviewEntityType, entity.id);
  const metadata = getEntityMetadata(preview, entity.type as PreviewEntityType);

  const handleClick = () => {
    const route = ENTITY_ROUTE_MAP[entity.type as PreviewEntityType];
    const url = `/campaigns/${campaignId}/${route}?selectedId=${entity.id}`;
    window.open(url, '_blank');
  };

  const badgeContent = (
    <Badge
      variant="outline"
      className={cn(
        'flex items-center gap-1 px-2 py-1 cursor-pointer transition-colors',
        config.className,
        !isEditing && config.hoverClassName
      )}
      onClick={!isEditing ? handleClick : undefined}
    >
      <Icon className="h-3 w-3" />
      <span>{entity.name}</span>
      {isEditing && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(entity.id);
          }}
          className="ml-1 hover:text-destructive"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );

  if (isEditing) {
    return badgeContent;
  }

  return (
    <HoverCard openDelay={300}>
      <HoverCardTrigger asChild>
        {badgeContent}
      </HoverCardTrigger>
      <HoverCardContent className="w-64">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={cn('rounded-full p-2', config.className)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold truncate">{entity.name}</h4>
              <p className="text-xs text-muted-foreground capitalize">
                {entity.type.replace('_', ' ')}
              </p>
            </div>
          </div>
          {metadata && (
            <p className="text-sm text-muted-foreground">{metadata}</p>
          )}
          <p className="text-xs text-muted-foreground italic">Click to open in new tab</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

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
    <SectionCard
      title="Quick Links"
      description="Pin entities for quick access during the session"
    >
      {/* Pinned entities */}
      <div className="flex flex-wrap gap-2">
        {pinnedEntities.length === 0 && !isEditing && (
          <p className="text-sm text-muted-foreground italic py-2">
            No entities pinned
          </p>
        )}

        {pinnedEntities.map((entity) => (
          <PinnedEntityBadge
            key={entity.id}
            entity={entity}
            campaignId={campaignId}
            isEditing={isEditing}
            onRemove={handleRemoveEntity}
          />
        ))}

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
    </SectionCard>
  );
}
