import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';

interface TimelineHeaderProps {
    campaignId: string;
    campaignName?: string;
    onAddEventClick: () => void;
}

export function TimelineHeader({
    campaignId,
    campaignName,
    onAddEventClick,
}: TimelineHeaderProps) {
    return (
        <div className="space-y-4 mb-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/campaigns">My Campaigns</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={`/campaigns/${campaignId}`}>{campaignName || 'Campaign'}</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Timeline</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Timeline</h1>
                <Button
                    onClick={onAddEventClick}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                </Button>
            </div>
        </div>
    );
}
