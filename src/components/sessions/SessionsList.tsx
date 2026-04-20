'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { SessionCard } from './SessionCard';
import type { SessionDTO } from '@/types/sessions';

interface SessionsListProps {
  sessions: SessionDTO[];
  selectedSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  isLoading: boolean;
}

export function SessionsList({
  sessions,
  selectedSessionId,
  onSessionSelect,
  isLoading,
}: SessionsListProps) {
  const [localSearch, setLocalSearch] = useState('');

  const filteredSessions = useMemo(() => {
    let filtered = sessions;
    if (localSearch) {
      const searchLower = localSearch.toLowerCase();
      filtered = sessions.filter(
        (s) =>
          s.title?.toLowerCase().includes(searchLower) ||
          `session ${s.session_number}`.includes(searchLower) ||
          `#${s.session_number}`.includes(searchLower)
      );
    }
    return [...filtered].sort((a, b) => b.session_number - a.session_number);
  }, [sessions, localSearch]);

  return (
    <div className="flex h-full flex-col">
      {/* Search bar */}
      <div className="px-3 pb-2 pt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 space-y-1.5 overflow-y-auto px-3 py-2 border-t">
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        )}

        {!isLoading && filteredSessions.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">No sessions found</p>
          </div>
        )}

        {!isLoading &&
          filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isSelected={session.id === selectedSessionId}
              onClick={() => onSessionSelect(session.id)}
            />
          ))}
      </div>
    </div>
  );
}
