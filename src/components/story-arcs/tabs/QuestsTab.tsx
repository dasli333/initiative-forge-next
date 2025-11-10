'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollText } from 'lucide-react';
import Link from 'next/link';
import type { QuestDTO } from '@/types/quests';

interface QuestsTabProps {
  storyArcId: string;
  quests: QuestDTO[];
  campaignId: string;
}

const questStatusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  not_started: 'secondary',
  active: 'default',
  completed: 'outline',
  failed: 'destructive',
};

function QuestMiniCard({ quest, onClick }: { quest: QuestDTO; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
    >
      <ScrollText className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{quest.title}</p>
      </div>
      <Badge variant={questStatusVariants[quest.status] || 'default'}>
        {quest.status.replace('_', ' ')}
      </Badge>
    </div>
  );
}

export function QuestsTab({ storyArcId, quests, campaignId }: QuestsTabProps) {
  const router = useRouter();

  const relatedQuests = useMemo(() => {
    return quests
      .filter((q) => q.story_arc_id === storyArcId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [quests, storyArcId]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Quests in this Arc</h3>
        <Badge variant="outline">{relatedQuests.length} quests</Badge>
      </div>

      {relatedQuests.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="mb-2">No quests assigned to this story arc yet</p>
          <Button variant="link" asChild>
            <Link href={`/campaigns/${campaignId}/quests`}>
              Browse Quests →
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {relatedQuests.map((quest) => (
            <QuestMiniCard
              key={quest.id}
              quest={quest}
              onClick={() => router.push(`/campaigns/${campaignId}/quests?selectedId=${quest.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
