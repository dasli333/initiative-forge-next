'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Plus, BookOpen } from 'lucide-react';
import { SessionCard } from './SessionCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import type { SessionDTO } from '@/types/sessions';

interface SessionsBrowseGridProps {
  sessions: SessionDTO[];
  isLoading: boolean;
  onSessionSelect: (sessionId: string) => void;
  onCreateClick: () => void;
}

export function SessionsBrowseGrid({
  sessions,
  isLoading,
  onSessionSelect,
  onCreateClick,
}: SessionsBrowseGridProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = sessions;
    if (search) {
      const q = search.toLowerCase();
      list = sessions.filter(
        (s) =>
          s.title?.toLowerCase().includes(q) ||
          `session ${s.session_number}`.includes(q) ||
          `#${s.session_number}`.includes(q)
      );
    }
    return [...list].sort((a, b) => b.session_number - a.session_number);
  }, [sessions, search]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <EmptyState
          icon={BookOpen}
          title="No Sessions Yet"
          description="Create your first session to start planning."
        />
        <Button
          onClick={onCreateClick}
          className="mt-4 bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Create First Session
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Search bar */}
      <div className="max-w-md mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Create tile */}
        <button
          type="button"
          onClick={onCreateClick}
          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 p-6 text-muted-foreground hover:border-primary hover:text-primary transition-colors min-h-[104px]"
        >
          <Plus className="h-6 w-6" />
          <span className="text-sm font-medium">New Session</span>
        </button>

        {filtered.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            isSelected={false}
            onClick={() => onSessionSelect(session.id)}
          />
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
            No sessions match &ldquo;{search}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}
