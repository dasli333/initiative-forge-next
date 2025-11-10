'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LocationTypeBadge } from './LocationTypeBadge';
import type { LocationDTO } from '@/types/locations';

interface LocationCardProps {
  location: LocationDTO;
  childrenCount: number;
  onClick: (locationId: string) => void;
}

export function LocationCard({
  location,
  childrenCount,
  onClick,
}: LocationCardProps) {
  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
      onClick={() => onClick(location.id)}
    >
      <CardContent className="p-0">
        {location.image_url && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            <img
              src={location.image_url}
              alt={location.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-lg truncate">{location.name}</h3>
          <div className="flex items-center justify-between">
            <LocationTypeBadge type={location.location_type} />
            {childrenCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {childrenCount} {childrenCount === 1 ? 'location' : 'locations'}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
