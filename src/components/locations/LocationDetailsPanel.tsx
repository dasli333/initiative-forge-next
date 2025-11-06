'use client';

import { LocationDetails } from './LocationDetails';
import { RootLocationsGrid } from './RootLocationsGrid';
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

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        {!selectedLocation ? (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">All Locations</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Select a location from the grid below to view details
              </p>
            </div>
            <RootLocationsGrid
              locations={locations}
              onLocationSelect={onLocationSelect}
            />
          </div>
        ) : (
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
        )}
      </div>
    </ScrollArea>
  );
}
