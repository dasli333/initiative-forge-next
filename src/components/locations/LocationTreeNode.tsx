'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronRight,
  ChevronDown,
  Globe,
  Castle,
  Building2,
  Home,
  Skull,
  MapPin,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { LocationTreeData } from '@/lib/utils/locationTreeUtils';

interface LocationTreeNodeProps<T extends { id: string; name: string; location_type: string; parent_location_id: string | null }> {
  node: LocationTreeData<T>;
  isSelected: boolean;
  onSelect: (locationId: string) => void;
  onToggleExpand: (locationId: string) => void;
  level: number;
}

const LOCATION_TYPE_ICONS = {
  kontynent: Globe,
  królestwo: Castle,
  miasto: Building2,
  budynek: Home,
  dungeon: Skull,
  inne: MapPin,
} as const;

export function LocationTreeNode<T extends { id: string; name: string; location_type: string; parent_location_id: string | null }>({
  node,
  isSelected,
  onSelect,
  onToggleExpand,
  level,
}: LocationTreeNodeProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: node.location.id,
    data: {
      type: 'location',
      location: node.location,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon =
    LOCATION_TYPE_ICONS[node.location.location_type as keyof typeof LOCATION_TYPE_ICONS] ||
    MapPin;

  const hasChildren = node.childrenCount > 0;
  const paddingLeft = level * 16 + 8; // 16px per level + 8px base padding

  return (
    <div>
      {/* Node row */}
      <div
        ref={setNodeRef}
        style={{ ...style, paddingLeft: `${paddingLeft}px` }}
        className={cn(
          'group flex items-center gap-2 py-1.5 px-2 cursor-pointer transition-colors',
          'hover:bg-accent/50 rounded-md',
          isSelected && 'bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50',
          isDragging && 'opacity-40',
          isOver && 'bg-emerald-100 dark:bg-emerald-950/50'
        )}
        onClick={() => onSelect(node.location.id)}
      >
        {/* Drag handle */}
        <button
          type="button"
          className={cn(
            'cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity',
            'text-muted-foreground hover:text-foreground'
          )}
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          aria-label="Drag to move location"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Expand/collapse button or spacer */}
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node.location.id);
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={node.isExpanded ? 'Collapse' : 'Expand'}
          >
            {node.isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="w-4" />
        )}

        {/* Location icon */}
        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />

        {/* Location name */}
        <span className={cn('text-sm truncate flex-1', isSelected && 'font-medium')}>
          {node.location.name}
        </span>

        {/* Children count badge */}
        {hasChildren && (
          <Badge variant="secondary" className="text-xs h-5 px-1.5">
            {node.childrenCount}
          </Badge>
        )}
      </div>

      {/* Recursive children rendering */}
      {hasChildren && node.isExpanded && (
        <div>
          {node.children.map((childNode) => (
            <LocationTreeNode
              key={childNode.location.id}
              node={childNode}
              isSelected={isSelected}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
