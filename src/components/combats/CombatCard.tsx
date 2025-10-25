'use client';

import { Circle, Users, MoreVertical, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { CombatSummaryDTO } from '@/types';

export interface CombatCardProps {
  combat: CombatSummaryDTO;
  onResume: (combat: CombatSummaryDTO) => void;
  onView: (combat: CombatSummaryDTO) => void;
  onDelete: (combat: CombatSummaryDTO) => void;
}

export function CombatCard({ combat, onResume, onView, onDelete }: CombatCardProps) {
  const isActive = combat.status === 'active';

  // Format date
  let formattedDate: string;
  try {
    formattedDate = formatDistanceToNow(new Date(combat.updated_at), {
      addSuffix: true,
    });
  } catch {
    formattedDate = 'Unknown date';
  }

  // Format participants count
  let participantsText: string;
  if (combat.participant_count === 0) {
    participantsText = 'No participants';
  } else if (combat.participant_count === 1) {
    participantsText = '1 participant';
  } else {
    participantsText = `${combat.participant_count} participants`;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="truncate text-lg font-semibold">{combat.name}</CardTitle>
          <Badge variant={isActive ? 'default' : 'secondary'} className={isActive ? 'bg-emerald-600' : ''}>
            {isActive ? 'Active' : 'Completed'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {isActive && (
          <div className="flex items-center gap-2 text-sm">
            <Circle className="h-4 w-4" />
            <span>Round {combat.current_round}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{participantsText}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {isActive ? 'Started' : 'Completed'} {formattedDate}
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          onClick={() => (isActive ? onResume(combat) : onView(combat))}
          variant={isActive ? 'default' : 'secondary'}
          className={isActive ? 'flex-1 bg-emerald-600 hover:bg-emerald-700' : 'flex-1'}
        >
          {isActive ? 'Resume Combat' : 'View Combat'}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onDelete(combat)} className="text-red-600" aria-label="Delete combat">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
