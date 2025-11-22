import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { TimelineEventForm } from './TimelineEventForm';
import { TimelineEventDTO, CreateTimelineEventCommand, UpdateTimelineEventCommand } from '@/types/timeline-events';

interface TimelineEventModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'create' | 'edit';
    initialData?: TimelineEventDTO;
    campaignId: string;
    onSubmit: (data: CreateTimelineEventCommand | UpdateTimelineEventCommand) => void;
    isSubmitting?: boolean;
}

export function TimelineEventModal({
    open,
    onOpenChange,
    mode,
    initialData,
    campaignId,
    onSubmit,
    isSubmitting,
}: TimelineEventModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Add Timeline Event' : 'Edit Timeline Event'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? 'Add a new event to the campaign timeline.'
                            : 'Update the details of this timeline event.'}
                    </DialogDescription>
                </DialogHeader>
                <TimelineEventForm
                    mode={mode}
                    initialData={initialData}
                    campaignId={campaignId}
                    onSubmit={onSubmit}
                    onCancel={() => onOpenChange(false)}
                    isSubmitting={isSubmitting}
                />
            </DialogContent>
        </Dialog>
    );
}
