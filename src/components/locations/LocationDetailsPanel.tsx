'use client';

import { MapPin } from 'lucide-react';
import { LocationDetails } from './LocationDetails';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { LocationDTO } from '@/types/locations';
import type { JSONContent } from '@tiptap/react';

interface LocationDetailsPanelProps {
  selectedLocationId: string | null;
  locations: LocationDTO[];
  campaignId: string;
  onLocationSelect: (locationId: string) => void;
  onNameUpdate: (locationId: string, name: string) => Promise<void>;
  onDescriptionUpdate: (locationId: string, descriptionJson: JSONContent) => Promise<void>;
  onDeleteLocation: (locationId: string) => Promise<void>;
  onAddChild: (parentId: string) => void;
}

export function LocationDetailsPanel({
  selectedLocationId,
  locations,
  campaignId,
  onLocationSelect,
  onNameUpdate,
  onDescriptionUpdate,
  onDeleteLocation,
  onAddChild,
}: LocationDetailsPanelProps) {
  const selectedLocation = selectedLocationId
    ? locations.find((loc) => loc.id === selectedLocationId)
    : null;

  const children = selectedLocationId
    ? locations.filter((loc) => loc.parent_location_id === selectedLocationId)
    : [];

  return !selectedLocation ? (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <MapPin className="h-16 w-16 text-muted-foreground" />
        <div>
          <h3 className="text-lg font-semibold">No Location Selected</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Select a location from the tree to view details, or create a new one to get started.
          </p>
        </div>
      </div>
    </div>
  ) : (
    <ScrollArea className="h-full">
      <div className="p-6">
        <LocationDetails
          location={selectedLocation}
          childLocations={children}
          allLocations={locations}
          campaignId={campaignId}
          onNameUpdate={(name) => onNameUpdate(selectedLocation.id, name)}
          onDescriptionUpdate={(json) =>
            onDescriptionUpdate(selectedLocation.id, json)
          }
          onDelete={() => onDeleteLocation(selectedLocation.id)}
          onNavigateToLocation={onLocationSelect}
          onAddChild={() => onAddChild(selectedLocation.id)}
        />
      </div>
    </ScrollArea>
  );
}
