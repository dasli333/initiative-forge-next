import { TimelineView } from '@/components/timeline/TimelineView';
import { getSupabaseServerClient } from '@/lib/supabase.server';
import { notFound } from 'next/navigation';

interface TimelinePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function TimelinePage({ params }: TimelinePageProps) {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();

    // Verify campaign exists and user has access
    const { data: campaign, error } = await supabase
        .from('campaigns')
        .select('id, name')
        .eq('id', id)
        .single();

    if (error || !campaign) {
        notFound();
    }

    return <TimelineView campaignId={campaign.id} campaignName={campaign.name} />;
}
