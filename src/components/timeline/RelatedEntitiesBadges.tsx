import { Badge } from '@/components/ui/badge';
import { RelatedEntity } from '@/types/timeline-view.types';
import { getEntityTypeIcon, getEntityTypePath } from '@/lib/utils/timeline.utils';
import Link from 'next/link';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface RelatedEntitiesBadgesProps {
    entities: RelatedEntity[];
    campaignId: string;
    limit?: number;
}

export function RelatedEntitiesBadges({ entities, campaignId, limit }: RelatedEntitiesBadgesProps) {
    if (!entities || entities.length === 0) return null;

    const displayEntities = limit ? entities.slice(0, limit) : entities;
    const remainingCount = limit ? entities.length - limit : 0;

    return (
        <div className="flex flex-wrap gap-2">
            <TooltipProvider>
                {displayEntities.map((entity) => {
                    const Icon = getEntityTypeIcon(entity.type);
                    const path = getEntityTypePath(entity.type, campaignId, entity.id);

                    return (
                        <Tooltip key={`${entity.type}-${entity.id}`}>
                            <TooltipTrigger asChild>
                                <Link href={path}>
                                    <Badge variant="secondary" className="flex items-center gap-1 cursor-pointer hover:bg-secondary/80">
                                        <Icon className="h-3 w-3" />
                                        <span className="truncate max-w-[150px]">{entity.name}</span>
                                    </Badge>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="capitalize">{entity.type}: {entity.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
                {remainingCount > 0 && (
                    <Badge variant="outline">+{remainingCount} more</Badge>
                )}
            </TooltipProvider>
        </div>
    );
}
