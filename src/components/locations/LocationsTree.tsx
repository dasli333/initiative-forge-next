'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { LocationDTO } from '@/types/locations';
import { buildLocationTree, canDropLocation } from '@/lib/utils/locationTreeUtils';
import { LocationTreeNode } from './LocationTreeNode';

interface LocationsTreeProps {
  locations: LocationDTO[];
  selectedLocationId: string | null;
  onLocationSelect: (locationId: string) => void;
  onLocationMove: (locationId: string, newParentId: string | null) => void;
}

export function LocationsTree({
  locations,
  selectedLocationId,
  onLocationSelect,
  onLocationMove,
}: LocationsTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Filter locations by search
  const filteredLocations = useMemo(() => {
    if (!localSearch.trim()) {
      return locations;
    }
    const searchLower = localSearch.toLowerCase();
    return locations.filter((loc) =>
      loc.name.toLowerCase().includes(searchLower)
    );
  }, [locations, localSearch]);

  // Build tree structure
  const tree = useMemo(
    () => buildLocationTree(filteredLocations, expandedNodes),
    [filteredLocations, expandedNodes]
  );

  // Get all location IDs for sortable context
  const allLocationIds = useMemo(() => locations.map((loc) => loc.id), [locations]);

  const handleToggleExpand = (locationId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(locationId)) {
        next.delete(locationId);
      } else {
        next.add(locationId);
      }
      return next;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over) {
      // Dropped outside, no action
      return;
    }

    const draggedId = active.id as string;
    const targetId = over.id as string;

    // If dropped on itself, no action
    if (draggedId === targetId) {
      return;
    }

    // Find the target location
    const targetLocation = locations.find((loc) => loc.id === targetId);
    if (!targetLocation) {
      return;
    }

    // Validate the drop
    if (!canDropLocation(draggedId, targetId, locations)) {
      toast.error('Cannot move location: circular reference detected');
      return;
    }

    // Find the dragged location's current parent
    const draggedLocation = locations.find((loc) => loc.id === draggedId);
    const currentParentId = draggedLocation?.parent_location_id ?? null;

    // If parent hasn't changed, no action
    if (currentParentId === targetId) {
      return;
    }

    // Perform the move
    onLocationMove(draggedId, targetId);

    // Auto-expand the new parent to show the moved location
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      next.add(targetId);
      return next;
    });

    toast.success('Location moved successfully');
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Get active location for drag overlay
  const activeLocation = activeId
    ? locations.find((loc) => loc.id === activeId)
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-3 pt-3 pb-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search locations..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={allLocationIds} strategy={verticalListSortingStrategy}>
            <ScrollArea className="h-full">
              <div className="px-3 py-2" role="tree" aria-label="Locations hierarchy">
                {tree.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      {locations.length === 0 ? 'No locations yet' : 'No locations match search'}
                    </p>
                    {locations.length > 0 && (
                      <button
                        onClick={() => setLocalSearch('')}
                        className="mt-2 text-xs text-primary hover:underline"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  tree.map((node) => (
                    <LocationTreeNode
                      key={node.location.id}
                      node={node}
                      isSelected={selectedLocationId === node.location.id}
                      onSelect={onLocationSelect}
                      onToggleExpand={handleToggleExpand}
                      level={0}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </SortableContext>

          {/* Drag overlay */}
          <DragOverlay>
            {activeLocation ? (
              <div className="bg-background border border-border rounded-md p-2 shadow-lg">
                <span className="text-sm font-medium">{activeLocation.name}</span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Footer stats */}
      <div className="px-3 py-2 border-t text-xs text-muted-foreground">
        Showing {filteredLocations.length} of {locations.length} locations
      </div>
    </div>
  );
}
