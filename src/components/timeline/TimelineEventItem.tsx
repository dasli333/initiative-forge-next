import { TimelineEventDTO } from '@/types/timeline-events';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { EventCardHeader, EventCardContent } from './EventCard';
import { cn } from '@/lib/utils';

interface TimelineEventItemProps {
    event: TimelineEventDTO;
    campaignId: string;
    onEdit: (event: TimelineEventDTO) => void;
    onDelete: (eventId: string) => void;
}

export function TimelineEventItem({ event, campaignId, onEdit, onDelete }: TimelineEventItemProps) {
    return (
        <div className="flex gap-4 relative pb-8 last:pb-0 group">
            {/* Timeline Line */}
            <div className="absolute left-[60px] top-8 bottom-0 w-px bg-border group-last:hidden" />

            {/* Date Badge (Left) */}
            <div className="w-[120px] flex-shrink-0 pt-1 text-right">
                <div className={cn(
                    "inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                )}>
                    {event.event_date}
                </div>
            </div>

            {/* Event Card (Right) */}
            <div className="flex-grow min-w-0">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={event.id} className="border rounded-lg bg-card px-4">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <EventCardHeader event={event} />
                        </AccordionTrigger>
                        <AccordionContent className="pt-0 pb-4">
                            <EventCardContent
                                event={event}
                                campaignId={campaignId}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
}
