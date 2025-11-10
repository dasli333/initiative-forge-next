'use client';

import { LocationCard } from './LocationCard';
import type { LocationDTO } from '@/types/locations';
import { useMemo } from 'react';

interface RootLocationsGridProps {
  locations: LocationDTO[];
  onLocationSelect: (locationId: string) => void;
}

export function RootLocationsGrid({
  locations,
  onLocationSelect,
}: RootLocationsGridProps) {
  // Filter root locations (no parent)
  const rootLocations = useMemo(
    () => locations.filter((loc) => !loc.parent_location_id),
    [locations]
  );

  // Calculate children count for each root location
  const locationsWithChildrenCount = useMemo(() => {
    return rootLocations.map((location) => {
      const childrenCount = locations.filter(
        (loc) => loc.parent_location_id === location.id
      ).length;
      return { location, childrenCount };
    });
  }, [rootLocations, locations]);

  if (rootLocations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No locations yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Create your first location to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {locationsWithChildrenCount.map(({ location, childrenCount }) => (
        <LocationCard
          key={location.id}
          location={location}
          childrenCount={childrenCount}
          onClick={onLocationSelect}
        />
      ))}
    </div>
  );
}
