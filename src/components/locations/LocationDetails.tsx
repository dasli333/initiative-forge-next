'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { LocationTypeBadge } from './LocationTypeBadge';
import { LocationCard } from './LocationCard';
import { Trash2, Plus } from 'lucide-react';
import type { LocationDTO } from '@/types/locations';
import type { JSONContent } from '@tiptap/react';

interface LocationDetailsProps {
  location: LocationDTO;
  childLocations: LocationDTO[];
  allLocations: LocationDTO[];
  onNameUpdate: (name: string) => Promise<void>;
  onDescriptionUpdate: (descriptionJson: JSONContent) => Promise<void>;
  onDelete: () => Promise<void>;
  onNavigateToLocation: (locationId: string) => void;
  onAddChild: () => void;
}

export function LocationDetails({
  location,
  childLocations,
  allLocations,
  onNameUpdate,
  onDescriptionUpdate,
  onDelete,
  onNavigateToLocation,
  onAddChild,
}: LocationDetailsProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(location.name);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleNameBlur = async () => {
    if (editedName.trim() && editedName !== location.name) {
      await onNameUpdate(editedName.trim());
    } else {
      setEditedName(location.name);
    }
    setIsEditingName(false);
  };

  const handleDescriptionBlur = async () => {
    if (location.description_json) {
      await onDescriptionUpdate(location.description_json);
    }
  };

  const handleDelete = async () => {
    await onDelete();
    setShowDeleteDialog(false);
  };

  const childrenCount = childLocations.length;

  return (
    <div className="space-y-6">
      {/* Image */}
      {location.image_url && (
        <div className="w-full h-96 rounded-lg overflow-hidden">
          <img
            src={location.image_url}
            alt={location.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="space-y-4">
        {isEditingName ? (
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameBlur();
              if (e.key === 'Escape') {
                setEditedName(location.name);
                setIsEditingName(false);
              }
            }}
            autoFocus
            className="text-3xl font-bold"
          />
        ) : (
          <h1
            className="text-3xl font-bold cursor-pointer hover:text-emerald-600"
            onClick={() => setIsEditingName(true)}
          >
            {location.name}
          </h1>
        )}
        <LocationTypeBadge type={location.location_type} />
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            value={location.description_json}
            onChange={(json) => {
              // Update will happen on blur
            }}
            onBlur={handleDescriptionBlur}
            placeholder="Add a description for this location..."
          />
        </CardContent>
      </Card>

      {/* Coordinates */}
      {location.coordinates_json && (
        <Card>
          <CardHeader>
            <CardTitle>Coordinates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Latitude: {location.coordinates_json.lat}, Longitude:{' '}
              {location.coordinates_json.lng}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Children */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Locations ({childrenCount})</CardTitle>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={onAddChild}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Location
          </Button>
        </CardHeader>
        <CardContent>
          {childrenCount === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No child locations yet
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {childLocations.map((child) => {
                const grandchildrenCount = allLocations.filter(
                  (loc) => loc.parent_location_id === child.id
                ).length;
                return (
                  <LocationCard
                    key={child.id}
                    location={child}
                    childrenCount={grandchildrenCount}
                    onClick={onNavigateToLocation}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete */}
      <div className="flex justify-end">
        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Location
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location</AlertDialogTitle>
            <AlertDialogDescription>
              {childrenCount > 0
                ? `This location has ${childrenCount} child location(s). Deleting it will move children to root level. Continue?`
                : 'Are you sure you want to delete this location? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
