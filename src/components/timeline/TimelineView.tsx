'use client';

import { useState } from 'react';
import { TimelineHeader } from './TimelineHeader';
import { TimelineList } from './TimelineList';
import { TimelineEventModal } from './TimelineEventModal';
import { useTimelineEventsQuery, useCreateTimelineEventMutation, useUpdateTimelineEventMutation, useDeleteTimelineEventMutation } from '@/hooks/useTimelineEvents';
import { TimelineEventDTO, CreateTimelineEventCommand, UpdateTimelineEventCommand } from '@/types/timeline-events';
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

interface TimelineViewProps {
    campaignId: string;
    campaignName?: string;
}

export function TimelineView({ campaignId, campaignName }: TimelineViewProps) {
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedEvent, setSelectedEvent] = useState<TimelineEventDTO | undefined>(undefined);

    // Delete Confirmation State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<string | null>(null);

    // Queries & Mutations
    const { data: events, isLoading, error } = useTimelineEventsQuery(campaignId);
    const createMutation = useCreateTimelineEventMutation(campaignId);
    const updateMutation = useUpdateTimelineEventMutation(campaignId);
    const deleteMutation = useDeleteTimelineEventMutation(campaignId);

    // Handlers
    const handleAddClick = () => {
        setModalMode('create');
        setSelectedEvent(undefined);
        setIsModalOpen(true);
    };

    const handleEditClick = (event: TimelineEventDTO) => {
        setModalMode('edit');
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (eventId: string) => {
        setEventToDelete(eventId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (eventToDelete) {
            await deleteMutation.mutateAsync(eventToDelete);
            setDeleteDialogOpen(false);
            setEventToDelete(null);
        }
    };

    const handleModalSubmit = async (data: CreateTimelineEventCommand | UpdateTimelineEventCommand) => {
        if (modalMode === 'create') {
            await createMutation.mutateAsync(data as CreateTimelineEventCommand);
        } else {
            if (!selectedEvent) return;
            await updateMutation.mutateAsync({
                eventId: selectedEvent.id,
                command: data as UpdateTimelineEventCommand,
            });
        }
        setIsModalOpen(false);
    };

    if (error) {
        return <div className="p-4 text-red-500">Error loading timeline: {(error as Error).message}</div>;
    }

    return (
        <div className="container mx-auto py-6 max-w-5xl">
            <TimelineHeader
                campaignId={campaignId}
                campaignName={campaignName}
                onAddEventClick={handleAddClick}
            />

            <TimelineList
                events={events || []}
                campaignId={campaignId}
                isLoading={isLoading}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onAddEventClick={handleAddClick}
            />

            <TimelineEventModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                mode={modalMode}
                initialData={selectedEvent}
                campaignId={campaignId}
                onSubmit={handleModalSubmit}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Timeline Event</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this event? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
