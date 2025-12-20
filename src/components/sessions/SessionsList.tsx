'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { SessionCard } from './SessionCard';
import type { SessionDTO, SessionStatus, SessionFilters } from '@/types/sessions';

interface SessionsListProps {
  sessions: SessionDTO[];
  selectedSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  filters: SessionFilters;
  onFiltersChange: (filters: SessionFilters) => void;
  isLoading: boolean;
}

type SortOption = 'number-desc' | 'number-asc' | 'date-desc' | 'date-asc';

const statusOptions: { value: SessionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Sessions' },
  { value: 'draft', label: 'Draft' },
  { value: 'ready', label: 'Ready' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export function SessionsList({
  sessions,
  selectedSessionId,
  onSessionSelect,
  filters,
  onFiltersChange,
  isLoading,
}: SessionsListProps) {
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('number-desc');

  // Client-side search & sort
  const filteredAndSortedSessions = useMemo(() => {
    // Filter by search
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

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'number-desc':
          return b.session_number - a.session_number;
        case 'number-asc':
          return a.session_number - b.session_number;
        case 'date-desc':
          return new Date(b.session_date).getTime() - new Date(a.session_date).getTime();
        case 'date-asc':
          return new Date(a.session_date).getTime() - new Date(b.session_date).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [sessions, localSearch, sortBy]);

  const handleStatusFilterChange = (value: string) => {
    if (value === 'all') {
      onFiltersChange({});
    } else {
      onFiltersChange({ status: value as SessionStatus });
    }
  };

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

      {/* Filters row */}
      <div className="px-3 pb-2 flex gap-2">
        {/* Status filter */}
        <Select
          value={filters.status || 'all'}
          onValueChange={handleStatusFilterChange}
        >
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort dropdown */}
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="number-desc">Latest First</SelectItem>
            <SelectItem value="number-asc">Oldest First</SelectItem>
            <SelectItem value="date-desc">Date (Newest)</SelectItem>
            <SelectItem value="date-asc">Date (Oldest)</SelectItem>
          </SelectContent>
        </Select>
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

        {!isLoading && filteredAndSortedSessions.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">No sessions found</p>
          </div>
        )}

        {!isLoading &&
          filteredAndSortedSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isSelected={session.id === selectedSessionId}
              onClick={() => onSessionSelect(session.id)}
            />
          ))}
      </div>

      {/* Footer stats */}
      <div className="border-t px-3 py-2 text-xs text-muted-foreground">
        Showing {filteredAndSortedSessions.length} of {sessions.length} sessions
      </div>
    </div>
  );
}
