'use client';

import { SplitLayout } from '@/components/shared/SplitLayout';
import { LocationDetailsPanel } from './LocationDetailsPanel';
import { LocationsTree } from './LocationsTree';
import type { LocationDTO } from '@/types/locations';
import type { JSONContent } from '@tiptap/react';

interface LocationsLayoutProps {
  locations: LocationDTO[];
  selectedLocationId: string | null;
  campaignId: string;
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
  campaignId,
  onLocationSelect,
  onLocationMove,
  onNameUpdate,
  onDescriptionUpdate,
  onDeleteLocation,
  onAddChild,
}: LocationsLayoutProps) {
  return (
    <SplitLayout
      leftPanel={
        <LocationsTree
          locations={locations}
          selectedLocationId={selectedLocationId}
          onLocationSelect={onLocationSelect}
          onLocationMove={onLocationMove}
        />
      }
      rightPanel={
        <LocationDetailsPanel
          selectedLocationId={selectedLocationId}
          locations={locations}
          campaignId={campaignId}
          onLocationSelect={onLocationSelect}
          onNameUpdate={onNameUpdate}
          onDescriptionUpdate={onDescriptionUpdate}
          onDeleteLocation={onDeleteLocation}
          onAddChild={onAddChild}
        />
      }
    />
  );
}
