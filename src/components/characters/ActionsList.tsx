'use client';

import { X } from 'lucide-react';
import type { ActionDTO } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ActionsListProps {
  actions: ActionDTO[];
  onRemove: (index: number) => void;
}

/**
 * Displays a list of character actions with remove buttons
 */
export const ActionsList = ({ actions, onRemove }: ActionsListProps) => {
  if (actions.length === 0) {
    return <p className="text-center text-sm text-muted-foreground py-4">No actions added yet</p>;
  }

  return (
    <div className="space-y-2">
      {actions.map((action, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base">{action.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {action.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemove(index)}
                aria-label={`Remove ${action.name}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          {(action.attack_bonus !== undefined || action.damage_dice || action.reach || action.range) && (
            <CardContent className="pb-3">
              <dl className="grid grid-cols-2 gap-2 text-sm">
                {action.attack_bonus !== undefined && (
                  <>
                    <dt className="text-muted-foreground">Attack:</dt>
                    <dd className="font-medium">
                      {action.attack_bonus >= 0 ? '+' : ''}
                      {action.attack_bonus}
                    </dd>
                  </>
                )}
                {action.reach && (
                  <>
                    <dt className="text-muted-foreground">Reach:</dt>
                    <dd className="font-medium">{action.reach}</dd>
                  </>
                )}
                {action.range && (
                  <>
                    <dt className="text-muted-foreground">Range:</dt>
                    <dd className="font-medium">{action.range}</dd>
                  </>
                )}
                {action.damage_dice && (
                  <>
                    <dt className="text-muted-foreground">Damage:</dt>
                    <dd className="font-medium">
                      {action.damage_dice}
                      {action.damage_bonus !== undefined &&
                        ` ${action.damage_bonus >= 0 ? '+' : ''}${action.damage_bonus}`}
                      {action.damage_type && ` ${action.damage_type}`}
                    </dd>
                  </>
                )}
              </dl>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
