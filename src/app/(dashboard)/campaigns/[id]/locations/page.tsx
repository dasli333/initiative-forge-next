'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LocationsHeader } from '@/components/locations/LocationsHeader';
import { LocationsLayout } from '@/components/locations/LocationsLayout';
import { LocationFormDialog } from '@/components/locations/LocationFormDialog';
import {
  useLocationsQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
} from '@/hooks/useLocations';
import { useCampaignQuery } from '@/hooks/useCampaigns';
import { Skeleton } from '@/components/ui/skeleton';
import type { CreateLocationCommand, UpdateLocationCommand } from '@/types/locations';
import type { JSONContent } from '@tiptap/react';

export default function LocationsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [parentLocationId, setParentLocationId] = useState<string | null>(null);

  // Fetch campaign and locations
  const { data: campaign, isLoading: isCampaignLoading } = useCampaignQuery(campaignId);
  const { data: locations = [], isLoading: isLocationsLoading } = useLocationsQuery(campaignId);

  // Mutations
  const createMutation = useCreateLocationMutation(campaignId);
  const updateMutation = useUpdateLocationMutation(campaignId);
  const deleteMutation = useDeleteLocationMutation(campaignId);

  const handleCreateLocation = async (data: CreateLocationCommand | UpdateLocationCommand) => {
    try {
      // Convert "__none__" to null for parent_location_id
      const command = {
        ...data,
        parent_location_id:
          data.parent_location_id === '__none__' ? null : data.parent_location_id,
      } as CreateLocationCommand;

      await createMutation.mutateAsync(command);
      toast.success('Location created successfully');
      setIsCreateDialogOpen(false);
      setParentLocationId(null);
    } catch (error) {
      toast.error('Failed to create location');
      console.error('Create location error:', error);
    }
  };

  const handleNameUpdate = async (locationId: string, name: string) => {
    try {
      await updateMutation.mutateAsync({
        id: locationId,
        command: { name },
      });
      toast.success('Location name updated');
    } catch (error) {
      toast.error('Failed to update location name');
      console.error('Update name error:', error);
    }
  };

  const handleDescriptionUpdate = async (
    locationId: string,
    descriptionJson: JSONContent
  ) => {
    try {
      await updateMutation.mutateAsync({
        id: locationId,
        command: { description_json: descriptionJson },
      });
      toast.success('Description updated');
    } catch (error) {
      toast.error('Failed to update description');
      console.error('Update description error:', error);
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    try {
      await deleteMutation.mutateAsync(locationId);
      toast.success('Location deleted');
      setSelectedLocationId(null);
    } catch (error) {
      toast.error('Failed to delete location');
      console.error('Delete location error:', error);
    }
  };

  const handleAddChild = (parentId: string) => {
    setParentLocationId(parentId);
    setIsCreateDialogOpen(true);
  };

  const handleLocationMove = async (locationId: string, newParentId: string | null) => {
    try {
      await updateMutation.mutateAsync({
        id: locationId,
        command: { parent_location_id: newParentId },
      });
      // Toast is handled by LocationsTree component
    } catch (error) {
      toast.error('Failed to move location');
      console.error('Move location error:', error);
    }
  };

  if (isCampaignLoading || isLocationsLoading) {
    return (
      <div className="flex flex-col h-full p-6 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (!campaign) {
    router.push('/campaigns');
    return null;
  }

  return (
    <div className="flex flex-col h-full p-6 gap-6">
      <LocationsHeader
        campaignName={campaign.name}
        campaignId={campaignId}
        onAddLocationClick={() => setIsCreateDialogOpen(true)}
      />

      <LocationsLayout
        locations={locations}
        selectedLocationId={selectedLocationId}
        campaignId={campaignId}
        onLocationSelect={setSelectedLocationId}
        onLocationMove={handleLocationMove}
        onNameUpdate={handleNameUpdate}
        onDescriptionUpdate={handleDescriptionUpdate}
        onDeleteLocation={handleDeleteLocation}
        onAddChild={handleAddChild}
      />

      <LocationFormDialog
        isOpen={isCreateDialogOpen}
        mode="create"
        parentLocationId={parentLocationId}
        locations={locations}
        campaignId={campaignId}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setParentLocationId(null);
        }}
        onSubmit={handleCreateLocation}
      />
    </div>
  );
}
