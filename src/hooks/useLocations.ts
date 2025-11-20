'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
} from '@/lib/api/locations';
import type { LocationDTO, CreateLocationCommand, UpdateLocationCommand, LocationFilters } from '@/types/locations';

/**
 * React Query hook for fetching locations for a campaign
 */
export function useLocationsQuery(campaignId: string, filters?: LocationFilters) {
  const router = useRouter();

  return useQuery({
    queryKey: ['locations', campaignId, filters],
    queryFn: async (): Promise<LocationDTO[]> => {
      try {
        return await getLocations(campaignId, filters);
      } catch (error) {
        // If unauthorized, redirect to login
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    enabled: !!campaignId,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * React Query hook for fetching a single location
 */
export function useLocationQuery(locationId: string | undefined) {
  const router = useRouter();

  return useQuery({
    queryKey: ['location', locationId],
    queryFn: async (): Promise<LocationDTO> => {
      if (!locationId) throw new Error('Location ID is required');

      try {
        return await getLocation(locationId);
      } catch (error) {
        // If unauthorized, redirect to login
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    enabled: !!locationId,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Mutation hook for creating a new location
 */
export function useCreateLocationMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (command: CreateLocationCommand): Promise<LocationDTO> => {
      try {
        return await createLocation(campaignId, command);
      } catch (error) {
        // If unauthorized, redirect to login
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async (command) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['locations', campaignId] });

      // Snapshot the previous value
      const previousLocations = queryClient.getQueryData<LocationDTO[]>(['locations', campaignId]);

      // Optimistically update to the new value
      if (previousLocations) {
        const tempLocation: LocationDTO = {
          id: `temp-${Date.now()}`,
          campaign_id: campaignId,
          name: command.name,
          location_type: command.location_type,
          description_json: command.description_json || null,
          parent_location_id: command.parent_location_id || null,
          image_url: command.image_url || null,
          coordinates_json: command.coordinates_json || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        queryClient.setQueryData<LocationDTO[]>(['locations', campaignId], [...previousLocations, tempLocation]);
      }

      // Return context with the snapshot
      return { previousLocations };
    },
    onError: (err, _command, context) => {
      // Rollback to the previous value on error
      if (context?.previousLocations) {
        queryClient.setQueryData(['locations', campaignId], context.previousLocations);
      }

      const errorMessage =
        err instanceof TypeError && err.message === 'Failed to fetch'
          ? 'Network error. Please check your connection.'
          : err instanceof Error
            ? err.message
            : 'Something went wrong. Please try again.';

      toast.error('Error', {
        description: errorMessage,
      });
    },
    onSuccess: () => {
      toast.success('Location created', {
        description: 'Your location has been created successfully.',
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['locations', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['entity-mentions'], refetchType: 'active' });
    },
  });
}

/**
 * Mutation hook for updating a location
 */
export function useUpdateLocationMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ id, command }: { id: string; command: UpdateLocationCommand }): Promise<LocationDTO> => {
      try {
        return await updateLocation(id, command);
      } catch (error) {
        // If unauthorized, redirect to login
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async ({ id, command }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['locations', campaignId] });
      await queryClient.cancelQueries({ queryKey: ['location', id] });

      // Snapshot the previous values
      const previousLocations = queryClient.getQueryData<LocationDTO[]>(['locations', campaignId]);
      const previousLocation = queryClient.getQueryData<LocationDTO>(['location', id]);

      // Optimistically update the locations list
      if (previousLocations) {
        queryClient.setQueryData<LocationDTO[]>(
          ['locations', campaignId],
          previousLocations.map((loc) =>
            loc.id === id
              ? ({
                  ...loc,
                  ...command,
                  // Deep clone description_json to avoid shared references
                  description_json:
                    command.description_json !== undefined
                      ? structuredClone(command.description_json)
                      : loc.description_json,
                } as LocationDTO)
              : loc
          )
        );
      }

      // Optimistically update the individual location
      if (previousLocation) {
        queryClient.setQueryData<LocationDTO>(['location', id], {
          ...previousLocation,
          ...command,
          // Deep clone description_json to avoid shared references
          description_json:
            command.description_json !== undefined
              ? structuredClone(command.description_json)
              : previousLocation.description_json,
        } as LocationDTO);
      }

      // Return context with the snapshots
      return { previousLocations, previousLocation };
    },
    onError: (err, variables, context) => {
      // Rollback to the previous values on error
      if (context?.previousLocations) {
        queryClient.setQueryData(['locations', campaignId], context.previousLocations);
      }
      if (context?.previousLocation) {
        queryClient.setQueryData(['location', variables.id], context.previousLocation);
      }

      const errorMessage =
        err instanceof TypeError && err.message === 'Failed to fetch'
          ? 'Network error. Please check your connection.'
          : err instanceof Error
            ? err.message
            : 'Something went wrong. Please try again.';

      toast.error('Error', {
        description: errorMessage,
      });
    },
    onSuccess: () => {
      toast.success('Location updated', {
        description: 'Location has been updated successfully.',
      });
    },
    onSettled: (_data, _error, variables) => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['locations', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['location', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['entity-preview', 'location', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['entity-mentions'], refetchType: 'active' });
    },
  });
}

/**
 * Mutation hook for deleting a location
 */
export function useDeleteLocationMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      try {
        await deleteLocation(id);
      } catch (error) {
        // If unauthorized, redirect to login
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['locations', campaignId] });

      // Snapshot the previous value
      const previousLocations = queryClient.getQueryData<LocationDTO[]>(['locations', campaignId]);

      // Optimistically update by removing the location
      if (previousLocations) {
        queryClient.setQueryData<LocationDTO[]>(
          ['locations', campaignId],
          previousLocations.filter((loc) => loc.id !== id)
        );
      }

      // Return context with snapshot
      return { previousLocations };
    },
    onError: (err, id, context) => {
      // Rollback
      if (context?.previousLocations) {
        queryClient.setQueryData(['locations', campaignId], context.previousLocations);
      }

      const errorMessage =
        err instanceof TypeError && err.message === 'Failed to fetch'
          ? 'Network error. Please check your connection.'
          : 'Failed to delete location. Please try again.';

      toast.error('Error', {
        description: errorMessage,
      });
    },
    onSuccess: () => {
      toast.success('Location deleted', {
        description: 'Location has been removed successfully.',
      });
    },
    onSettled: (_data, _error, id) => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['locations', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['location', id] });
    },
  });
}
