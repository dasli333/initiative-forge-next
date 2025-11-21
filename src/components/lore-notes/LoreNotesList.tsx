'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus } from 'lucide-react';
import { LoreNoteListItem } from './LoreNoteListItem';
import { LoreNoteFiltersCompact } from './LoreNoteFiltersCompact';
import type { LoreNoteDTO, LoreNoteFilters } from '@/types/lore-notes';

interface LoreNotesListProps {
  notes: LoreNoteDTO[];
  selectedNoteId: string | null;
  onNoteSelect: (noteId: string) => void;
  onCreateNote: () => void;
  filters: LoreNoteFilters;
  onFiltersChange: (filters: LoreNoteFilters) => void;
  isLoading: boolean;
}

type SortOption = 'recent' | 'name-asc' | 'name-desc' | 'category';

export function LoreNotesList({
  notes,
  selectedNoteId,
  onNoteSelect,
  onCreateNote,
  filters,
  onFiltersChange,
  isLoading,
}: LoreNotesListProps) {
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Extract all unique tags for filter
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((note) => {
      note.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  // Client-side search & sort
  const filteredAndSortedNotes = useMemo(() => {
    // Filter by search
    let filtered = notes;
    if (localSearch) {
      const searchLower = localSearch.toLowerCase();
      filtered = notes.filter((note) =>
        note.title.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return sorted;
  }, [notes, localSearch, sortBy]);

  return (
    <div className="flex h-full flex-col">
      {/* Header with Create button */}
      <div className="border-b px-3 py-3">
        <Button onClick={onCreateNote} className="w-full" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Lore Note
        </Button>
      </div>

      {/* Search bar */}
      <div className="px-3 pb-2 pt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Sort dropdown */}
      <div className="px-3 pb-2">
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recent</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="category">Category</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filters */}
      <div className="border-b px-3 pb-3">
        <LoreNoteFiltersCompact
          filters={filters}
          availableTags={availableTags}
          onFiltersChange={onFiltersChange}
        />
      </div>

      {/* Scrollable list */}
      <div className="flex-1 space-y-1.5 overflow-y-auto px-3 py-2">
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        )}

        {!isLoading && filteredAndSortedNotes.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {notes.length === 0 ? 'No lore notes yet' : 'No notes found'}
            </p>
            {notes.length === 0 && (
              <Button
                variant="link"
                size="sm"
                onClick={onCreateNote}
                className="mt-2"
              >
                Create your first note
              </Button>
            )}
          </div>
        )}

        {!isLoading &&
          filteredAndSortedNotes.map((note) => (
            <LoreNoteListItem
              key={note.id}
              note={note}
              isSelected={note.id === selectedNoteId}
              onClick={() => onNoteSelect(note.id)}
            />
          ))}
      </div>

      {/* Footer stats */}
      {!isLoading && notes.length > 0 && (
        <div className="border-t px-3 py-2 text-xs text-muted-foreground">
          Showing {filteredAndSortedNotes.length} of {notes.length} notes
        </div>
      )}
    </div>
  );
}
