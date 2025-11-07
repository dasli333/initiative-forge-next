'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Swords } from 'lucide-react';
import type { NPCCardViewModel } from '@/types/npcs';

interface NPCCardProps {
  viewModel: NPCCardViewModel;
  onClick: () => void;
}

/**
 * Card component for NPC grid view
 * - Image (200px square), name (H3), role badge
 * - Faction/location/status badges
 * - Combat ready indicator
 * - Hover effect, click → open slideover
 */
export function NPCCard({ viewModel, onClick }: NPCCardProps) {
  const { npc, hasCombatStats, factionName, locationName } = viewModel;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'alive':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'dead':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'unknown':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative w-full h-[200px] bg-muted overflow-hidden">
          {npc.image_url ? (
            <img
              src={npc.image_url}
              alt={npc.name}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-6xl font-bold">
                {npc.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Combat Ready Indicator */}
          {hasCombatStats && (
            <div className="absolute top-2 right-2 bg-background/90 rounded-full p-2 shadow-md">
              <Swords className="h-4 w-4 text-emerald-600" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Name */}
          <h3 className="font-semibold text-lg line-clamp-1">{npc.name}</h3>

          {/* Role Badge */}
          {npc.role && (
            <Badge variant="secondary" className="text-xs">
              {npc.role}
            </Badge>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {/* Status Badge */}
            <Badge variant="outline" className={getStatusColor(npc.status)}>
              {npc.status}
            </Badge>

            {/* Faction Badge */}
            {factionName && (
              <Badge variant="outline" className="text-xs">
                {factionName}
              </Badge>
            )}

            {/* Location Badge */}
            {locationName && (
              <Badge variant="outline" className="text-xs">
                {locationName}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
