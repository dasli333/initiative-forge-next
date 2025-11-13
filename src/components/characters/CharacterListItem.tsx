'use client';

import { User, Users, Swords, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlayerCharacterCardViewModel } from '@/types/player-characters';

interface CharacterListItemProps {
  character: PlayerCharacterCardViewModel;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Compact list item for player character in left sidebar
 * Shows avatar, name, class/level, faction, and combat indicator
 */
export function CharacterListItem({ character, isSelected, onClick }: CharacterListItemProps) {
  const statusColors = {
    active: 'bg-emerald-500',
    retired: 'bg-amber-500',
    deceased: 'bg-red-500',
  };

  const statusLabels = {
    active: 'Active',
    retired: 'Retired',
    deceased: 'Deceased',
  };

  // Format class/level display
  const classLevelText = [
    character.level && `Lv${character.level}`,
    character.class,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`character-card-${character.name}`}
      className={cn(
        'w-full px-3 py-2.5 flex items-start gap-3 rounded-lg border transition-colors text-left',
        'hover:bg-accent/50',
        isSelected
          ? 'bg-primary/10 border-primary'
          : 'bg-card'
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {character.image_url ? (
          <img
            src={character.image_url}
            alt={character.name}
            className="w-12 h-12 rounded-md object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
            <User className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
        {/* Status indicator */}
        <div
          className={cn(
            'absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background',
            statusColors[character.status]
          )}
          title={statusLabels[character.status]}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Name */}
        <div className="font-medium truncate">{character.name}</div>

        {/* Class/Level */}
        {classLevelText && (
          <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
            <Trophy className="w-3 h-3 shrink-0" />
            <span>{classLevelText}</span>
          </div>
        )}

        {/* Meta info */}
        <div className="mt-1.5 flex flex-wrap gap-1.5 items-center text-xs text-muted-foreground">
          {/* Faction */}
          {character.faction_name && (
            <span className="inline-flex items-center gap-1 truncate max-w-[120px]">
              <Users className="w-3 h-3 shrink-0" />
              <span className="truncate">{character.faction_name}</span>
            </span>
          )}

          {/* Combat stats indicator */}
          {character.hp_max && character.armor_class ? (
            <span
              className="inline-flex items-center text-emerald-600 dark:text-emerald-400"
              title={`Combat ready · HP ${character.hp_max} · AC ${character.armor_class}`}
            >
              <Swords className="w-3 h-3" />
            </span>
          ) : (
            <span
              className="inline-flex items-center text-amber-500 dark:text-amber-400"
              title="Missing combat stats"
            >
              <Swords className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
