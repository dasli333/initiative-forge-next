'use client';

import { useState } from 'react';
import Image from 'next/image';
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
import { ImageUpload } from '@/components/shared/ImageUpload';
import { LocationTypeBadge } from './LocationTypeBadge';
import { LocationCard } from './LocationCard';
import { BacklinksSection } from './BacklinksSection';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { buildBreadcrumb } from '@/lib/utils/locationTreeUtils';
import { ImageLightbox } from '@/components/shared/ImageLightbox';
import { deleteLocationImage } from '@/lib/api/storage';
import { Trash2, Plus, Pencil, Save, X, MapPin } from 'lucide-react';
import type { LocationDTO } from '@/types/locations';
import type { JSONContent } from '@tiptap/react';

interface LocationDetailsProps {
  location: LocationDTO;
  childLocations: LocationDTO[];
  allLocations: LocationDTO[];
  campaignId: string;
  onNameUpdate: (name: string) => Promise<void>;
  onDescriptionUpdate: (descriptionJson: JSONContent) => Promise<void>;
  onImageUpdate: (oldImageUrl: string | null, newImageUrl: string | null) => Promise<void>;
  onDelete: () => Promise<void>;
  onNavigateToLocation: (locationId: string) => void;
  onAddChild: () => void;
}

export function LocationDetails({
  location,
  childLocations,
  allLocations,
  campaignId,
  onNameUpdate,
  onDescriptionUpdate,
  onImageUpdate,
  onDelete,
  onNavigateToLocation,
  onAddChild,
}: LocationDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Derive state from location prop - resets automatically when location changes
  const [editedName, setEditedName] = useState(location.name);
  const [editedDescription, setEditedDescription] = useState<JSONContent | null>(
    location.description_json
  );
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(location.image_url);

  // Reset edited values when location ID changes
  const [prevLocationId, setPrevLocationId] = useState(location.id);
  if (prevLocationId !== location.id) {
    setPrevLocationId(location.id);
    setIsEditing(false);
    setEditedName(location.name);
    setEditedDescription(location.description_json);
    setEditedImageUrl(location.image_url);
  }

  const handleEditClick = () => {
    setEditedName(location.name);
    setEditedDescription(location.description_json);
    setEditedImageUrl(location.image_url);
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    // Save name if changed
    if (editedName.trim() && editedName !== location.name) {
      await onNameUpdate(editedName.trim());
    }
    // Save description if changed
    if (editedDescription !== location.description_json) {
      await onDescriptionUpdate(editedDescription || { type: 'doc', content: [] });
    }
    // Save image if changed; parent handles old-storage cleanup.
    if (editedImageUrl !== location.image_url) {
      await onImageUpdate(location.image_url, editedImageUrl);
    }
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    // Staged-delete: delete newly-uploaded image if user cancels edit.
    if (
      typeof editedImageUrl === 'string' &&
      editedImageUrl.startsWith('http') &&
      editedImageUrl !== location.image_url
    ) {
      deleteLocationImage(editedImageUrl).catch((err) => {
        console.error('Failed to delete abandoned location image:', err);
      });
    }
    setEditedName(location.name);
    setEditedDescription(location.description_json);
    setEditedImageUrl(location.image_url);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await onDelete();
    setShowDeleteDialog(false);
  };

  const childrenCount = childLocations.length;

  return (
    <div className="space-y-6">
      {/* Header: image + name/type + actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 flex gap-4 min-w-0">
          {/* Image */}
          <div className="shrink-0">
            {isEditing ? (
              <div className="w-40">
                <ImageUpload
                  value={editedImageUrl}
                  onChange={setEditedImageUrl}
                  campaignId={campaignId}
                  entityType="location"
                  maxSizeMB={5}
                  className="[&_img]:h-40 [&_img]:w-40"
                  deferStorageDelete
                />
              </div>
            ) : location.image_url ? (
              <ImageLightbox src={location.image_url} alt={location.name}>
                <Image
                  src={location.image_url}
                  alt={location.name}
                  width={160}
                  height={160}
                  className="w-40 h-40 rounded-lg object-cover border-2 border-border"
                />
              </ImageLightbox>
            ) : (
              <div className="w-40 h-40 rounded-lg bg-muted border-2 border-dashed border-border flex items-center justify-center">
                <MapPin className="w-16 h-16 text-muted-foreground/50" />
              </div>
            )}
          </div>

          {/* Name + Type */}
          <div className="flex-1 min-w-0 space-y-2">
            {isEditing ? (
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-3xl font-bold"
              />
            ) : (
              <h1 className="text-3xl font-bold">{location.name}</h1>
            )}
            <LocationTypeBadge type={location.location_type} />
          </div>
        </div>
        <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelClick}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleSaveClick}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={handleEditClick}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit Location
              </Button>
            )}
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      {(() => {
        const breadcrumbItems = buildBreadcrumb(location.id, allLocations);
        if (breadcrumbItems.length <= 1) return null;

        return (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbItems.slice(0, -1).map((item, index) => (
                <div key={item.id} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      className="cursor-pointer hover:text-emerald-600"
                      onClick={() => onNavigateToLocation(item.id)}
                    >
                      {item.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </div>
              ))}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{location.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        );
      })()}

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            value={isEditing ? editedDescription : location.description_json}
            onChange={setEditedDescription}
            readonly={!isEditing}
            placeholder="Add a description for this location..."
            campaignId={campaignId}
          />
        </CardContent>
      </Card>

      {/* Backlinks */}
      <BacklinksSection locationId={location.id} campaignId={campaignId} />

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
            Add Child Location
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
