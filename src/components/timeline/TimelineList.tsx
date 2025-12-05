import { TimelineEventDTO } from '@/types/timeline-events';
import { TimelineEventItem } from './TimelineEventItem';
import { EmptyState } from './EmptyState';
import { Skeleton } from '@/components/ui/skeleton';

interface TimelineListProps {
    events: TimelineEventDTO[];
    campaignId: string;
    isLoading: boolean;
    onEdit: (event: TimelineEventDTO) => void;
    onDelete: (eventId: string) => void;
    onAddEventClick: () => void;
}

export function TimelineList({
    events,
    campaignId,
    isLoading,
    onEdit,
    onDelete,
    onAddEventClick
}: TimelineListProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                        <Skeleton className="w-[120px] h-6 rounded-full" />
                        <Skeleton className="flex-grow h-24 rounded-lg" />
                    </div>
                ))}
            </div>
        );
    }

    if (!events || events.length === 0) {
        return <EmptyState onAddEventClick={onAddEventClick} />;
    }

    return (
        <div className="space-y-0">
            {events.map((event) => (
                <TimelineEventItem
                    key={event.id}
                    event={event}
                    campaignId={campaignId}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
