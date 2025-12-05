'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, ArrowUpDown } from 'lucide-react';
import { LoreNoteListItem } from './LoreNoteListItem';
import { LoreNoteFiltersCompact } from './LoreNoteFiltersCompact';
import { useLoreNoteTagsQuery } from '@/hooks/useLoreNoteTags';
import type { LoreNoteCardViewModel, LoreNoteFilters } from '@/types/lore-notes';

interface LoreNotesListProps {
  campaignId: string;
  notes: LoreNoteCardViewModel[];
  selectedNoteId: string | null;
  onNoteSelect: (noteId: string) => void;
  onCreateNote: () => void;
  filters: LoreNoteFilters;
  onFiltersChange: (filters: LoreNoteFilters) => void;
  isLoading: boolean;
}

type SortOption = 'recent' | 'name-asc' | 'name-desc' | 'category';

export function LoreNotesList({
  campaignId,
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

  // Fetch tags for filters
  const { data: tags = [] } = useLoreNoteTagsQuery(campaignId);

  // Client-side search & sort
  const filteredAndSortedNotes = useMemo(() => {
    // Filter by search
    let filtered = notes;
    if (localSearch) {
      const searchLower = localSearch.toLowerCase();
      filtered = notes.filter((noteVM) =>
        noteVM.note.title.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.note.created_at).getTime() - new Date(a.note.created_at).getTime();
        case 'name-asc':
          return a.note.title.localeCompare(b.note.title);
        case 'name-desc':
          return b.note.title.localeCompare(a.note.title);
        case 'category':
          return a.note.category.localeCompare(b.note.category);
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
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Sort dropdown */}
      <div className="px-3 pb-2">
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="h-8 text-xs w-full">
            <ArrowUpDown className="w-3 h-3 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently added</SelectItem>
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
          tags={tags}
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
          filteredAndSortedNotes.map((noteVM) => (
            <LoreNoteListItem
              key={noteVM.note.id}
              noteVM={noteVM}
              isSelected={noteVM.note.id === selectedNoteId}
              onClick={() => onNoteSelect(noteVM.note.id)}
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
