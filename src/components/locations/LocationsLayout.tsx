'use client';

import { LocationDetailsPanel } from './LocationDetailsPanel';
import { LocationsTree } from './LocationsTree';
import type { LocationDTO } from '@/types/locations';
import type { JSONContent } from '@tiptap/react';

interface LocationsLayoutProps {
  locations: LocationDTO[];
  selectedLocationId: string | null;
  onLocationSelect: (locationId: string) => void;
  onLocationMove: (locationId: string, newParentId: string | null) => void;
  onNameUpdate: (locationId: string, name: string) => Promise<void>;
  onDescriptionUpdate: (locationId: string, descriptionJson: JSONContent) => Promise<void>;
  onDeleteLocation: (locationId: string) => Promise<void>;
  onAddChild: (parentId: string) => void;
}

export function LocationsLayout({
  locations,
  selectedLocationId,
  onLocationSelect,
  onLocationMove,
  onNameUpdate,
  onDescriptionUpdate,
  onDeleteLocation,
  onAddChild,
}: LocationsLayoutProps) {
  return (
    <div className="flex-1 flex gap-6 overflow-hidden">
      {/* LEFT PANEL - Hierarchical tree */}
      <div className="w-[30%] border-r pr-6 overflow-hidden">
        <LocationsTree
          locations={locations}
          selectedLocationId={selectedLocationId}
          onLocationSelect={onLocationSelect}
          onLocationMove={onLocationMove}
        />
      </div>

      {/* RIGHT PANEL - Details */}
      <div className="flex-1 overflow-hidden">
        <LocationDetailsPanel
          selectedLocationId={selectedLocationId}
          locations={locations}
          onLocationSelect={onLocationSelect}
          onNameUpdate={onNameUpdate}
          onDescriptionUpdate={onDescriptionUpdate}
          onDeleteLocation={onDeleteLocation}
          onAddChild={onAddChild}
        />
      </div>
    </div>
  );
}
