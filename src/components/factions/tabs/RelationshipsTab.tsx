'use client';

import Image from 'next/image';
import { Shield, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { FactionRelationshipViewModel } from '@/types/factions';

interface RelationshipsTabProps {
  relationships: FactionRelationshipViewModel[];
  onAddRelationship: () => void;
  onEditRelationship: (relationship: FactionRelationshipViewModel) => void;
  onDeleteRelationship: (relationshipId: string) => void;
  isUpdating?: boolean;
}

export function RelationshipsTab({
  relationships,
  onAddRelationship,
  onEditRelationship,
  onDeleteRelationship,
  isUpdating = false,
}: RelationshipsTabProps) {
  const relationshipStyles = {
    alliance: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', label: 'Alliance' },
    war: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'War' },
    rivalry: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', label: 'Rivalry' },
    neutral: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', label: 'Neutral' },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Relationships ({relationships.length})</h3>
        <Button
          size="sm"
          onClick={onAddRelationship}
          disabled={isUpdating}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Relationship
        </Button>
      </div>

      {relationships.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No relationships yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {relationships.map((rel) => {
            const style = relationshipStyles[rel.relationship_type as keyof typeof relationshipStyles] || relationshipStyles.neutral;
            return (
              <div
                key={rel.id}
                className="flex items-start gap-3 p-4 rounded-lg border bg-card"
              >
                {rel.other_faction_image_url ? (
                  <Image
                    src={rel.other_faction_image_url}
                    alt={rel.other_faction_name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-md object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                    <Shield className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{rel.other_faction_name}</div>
                  <Badge className={`${style.color} mt-1`}>{style.label}</Badge>
                  {rel.description && (
                    <p className="text-sm text-muted-foreground mt-2">{rel.description}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEditRelationship(rel)}
                    disabled={isUpdating}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDeleteRelationship(rel.id)}
                    disabled={isUpdating}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
