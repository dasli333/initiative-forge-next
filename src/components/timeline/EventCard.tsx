import { TimelineEventDTO } from '@/types/timeline-events';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Link as LinkIcon } from 'lucide-react';
import { RelatedEntitiesBadges } from './RelatedEntitiesBadges';
import { RichTextEditor } from '@/components/shared/RichTextEditor';

interface EventCardHeaderProps {
    event: TimelineEventDTO;
    campaignId: string;
}

export function EventCardHeader({ event, campaignId }: EventCardHeaderProps) {
    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold leading-none tracking-tight">
                    {event.title}
                </h3>
                {event.source_type === 'session_log' && (
                    <Badge variant="outline" className="text-xs gap-1">
                        <LinkIcon className="h-3 w-3" />
                        Session Log
                    </Badge>
                )}
            </div>

            {/* Related Entities */}
            {event.related_entities_json.length > 0 && (
                <div>
                    <RelatedEntitiesBadges
                        entities={event.related_entities_json}
                        campaignId={campaignId}
                        limit={3}
                    />
                </div>
            )}
        </div>
    );
}

interface EventCardContentProps {
    event: TimelineEventDTO;
    campaignId: string;
    onEdit: (event: TimelineEventDTO) => void;
    onDelete: (eventId: string) => void;
}

export function EventCardContent({ event, campaignId, onEdit, onDelete }: EventCardContentProps) {
    const isManualEvent = event.source_type === 'manual' || event.source_type === null;

    return (
        <div className="flex flex-col gap-3 w-full">
            {/* Description */}
            {event.description_json && (
                <div>
                    <RichTextEditor
                        value={event.description_json}
                        onChange={() => {}}
                        readonly
                        campaignId={campaignId}
                        className="text-sm"
                    />
                </div>
            )}

            {/* Actions */}
            {isManualEvent && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(event);
                        }}
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(event.id);
                        }}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            )}
        </div>
    );
}
