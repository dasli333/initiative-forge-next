'use client';

import { useMemo } from 'react';
import { Pencil, Trash2, MoreVertical, Heart, Shield, Zap, Eye } from 'lucide-react';
import type { PlayerCharacter } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface AbilityScore {
  raw: number;
  modifier: number;
}

interface CharacterCardData {
  id: string;
  name: string;
  max_hp: number;
  armor_class: number;
  initiativeModifier: number;
  passivePerception: number;
  abilityScores: {
    str: AbilityScore;
    dex: AbilityScore;
    con: AbilityScore;
    int: AbilityScore;
    wis: AbilityScore;
    cha: AbilityScore;
  };
}

interface CharacterListGridProps {
  characters: PlayerCharacter[];
  onEdit: (character: PlayerCharacter) => void;
  onDelete: (characterId: string) => void;
}

/**
 * Transforms a PlayerCharacter to card data with calculated fields
 */
const toCardData = (char: PlayerCharacter): CharacterCardData => {
  const createAbilityScore = (raw: number): AbilityScore => ({
    raw,
    modifier: Math.floor((raw - 10) / 2),
  });

  return {
    id: char.id,
    name: char.name,
    max_hp: char.max_hp,
    armor_class: char.armor_class,
    initiativeModifier: Math.floor((char.dexterity - 10) / 2),
    passivePerception: 10 + Math.floor((char.wisdom - 10) / 2),
    abilityScores: {
      str: createAbilityScore(char.strength),
      dex: createAbilityScore(char.dexterity),
      con: createAbilityScore(char.constitution),
      int: createAbilityScore(char.intelligence),
      wis: createAbilityScore(char.wisdom),
      cha: createAbilityScore(char.charisma),
    },
  };
};

/**
 * Formats a modifier to include + or - sign
 */
const formatModifier = (modifier: number): string => {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

/**
 * Gets initials from a name for the avatar
 */
const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

/**
 * Character card component with Material Design 3 / Fluent 2 inspired design
 */
const CharacterCard = ({
  character,
  cardData,
  onEdit,
  onDelete,
}: {
  character: PlayerCharacter;
  cardData: CharacterCardData;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <Card
      data-testid={`character-card-${cardData.name}`}
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg"
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          {/* Avatar with initials */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-semibold text-lg shadow-md">
              {getInitials(cardData.name)}
            </div>
            <h3 className="font-semibold text-lg leading-tight truncate">{cardData.name}</h3>
          </div>

          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                data-testid="character-options-button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Actions"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem data-testid="edit-character-button" onClick={onEdit} className="cursor-pointer">
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                data-testid="delete-character-button"
                onClick={onDelete}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Primary Stats: HP and AC */}
        <div className="grid grid-cols-2 gap-3">
          {/* HP */}
          <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/20 p-3 border border-red-100 dark:border-red-900/30">
            <Heart className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground font-medium">HP</div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400">{cardData.max_hp}</div>
            </div>
          </div>

          {/* AC */}
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 border border-blue-100 dark:border-blue-900/30">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground font-medium">AC</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{cardData.armor_class}</div>
            </div>
          </div>
        </div>

        {/* Ability Scores - 3x2 Grid */}
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground font-medium mb-3">Ability Scores</div>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(cardData.abilityScores).map(([key, value]) => (
              <div key={key} className="flex flex-col items-center rounded-lg bg-secondary/50 p-2.5 border border-border/50">
                <div className="text-xs font-medium uppercase text-muted-foreground mb-1">{key}</div>
                <div className="text-xl font-bold">{value.raw}</div>
                <div className={`text-xs font-semibold ${value.modifier >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                  {formatModifier(value.modifier)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Secondary Stats: Initiative and Perception */}
        <div className="flex items-center justify-around pt-2 border-t text-xs">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Init:</span>
            <span data-testid="calculated-initiative" className="font-semibold">
              {formatModifier(cardData.initiativeModifier)}
            </span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Perc:</span>
            <span data-testid="calculated-passive-perception" className="font-semibold">
              {cardData.passivePerception}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Grid component displaying list of player characters as cards
 */
export const CharacterListGrid = ({ characters, onEdit, onDelete }: CharacterListGridProps) => {
  const cardData = useMemo(() => characters.map(toCardData), [characters]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {cardData.map((data, index) => {
        const character = characters[index];
        return (
          <CharacterCard
            key={data.id}
            character={character}
            cardData={data}
            onEdit={() => onEdit(character)}
            onDelete={() => onDelete(character.id)}
          />
        );
      })}
    </div>
  );
};
