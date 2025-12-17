'use client';

import { useState } from 'react';
import { EquipmentHeader } from './EquipmentHeader';
import { EquipmentList } from './EquipmentList';
import { EquipmentDetails } from './EquipmentDetails';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useDebouncedValue } from '@/components/hooks/useDebouncedValue';
import { useInfiniteEquipment } from '@/components/hooks/useInfiniteEquipment';
import { useLanguageStore } from '@/stores/languageStore';
import { FileSearch } from 'lucide-react';

/**
 * Get primary category from equipment categories
 */
function getPrimaryCategory(categories: Array<{ id: string; name: string }>): string {
  if (!categories || categories.length === 0) return 'Item';
  return categories[0].name;
}

/**
 * Format cost for display
 */
function formatCost(cost?: { quantity: number; unit: string }): string | null {
  if (!cost) return null;
  return `${cost.quantity} ${cost.unit}`;
}

/**
 * Main container component for the Equipment Library view
 * Manages all state and orchestrates child components
 *
 * Features:
 * - Split-view layout (30% list, 70% details)
 * - Search by equipment name (debounced 300ms)
 * - Filter by category
 * - Infinite scroll pagination in list
 * - Fixed detail view on the right
 * - React Query for server state management
 *
 * State management:
 * - Local state: filters (search, category), selected equipment
 * - Server state: React Query (equipment data, loading, error, pagination)
 */
export function EquipmentLibraryView() {
  // Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [category, setCategory] = useState<string | null>(null);

  // Debounced search query to reduce API calls
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  // Selected equipment state
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);

  // Get selected language from store
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);

  // Fetch equipment with React Query infinite query
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteEquipment({
    searchQuery: debouncedSearchQuery,
    category,
    limit: 30,
  });

  // Flatten paginated data into single array
  const equipment = data?.pages.flatMap((page) => page.equipment) ?? [];

  // Find selected equipment from loaded data
  const selectedEquipment = equipment.find((e) => e.id === selectedEquipmentId) ?? null;

  /**
   * Handlers
   */

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (newCategory: string | null) => {
    setCategory(newCategory);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategory(null);
  };

  const handleEquipmentClick = (equipmentId: string) => {
    setSelectedEquipmentId(equipmentId);
  };

  return (
    <div className="flex h-full -m-4 md:-m-8">
      {/* Left Panel - Equipment List (minimum 500px to fit filters, 30% width on larger screens) */}
      <div className="min-w-[500px] w-[30%] border-r border-border flex flex-col">
        {/* Header with filters - fixed at top of left panel */}
        <div className="p-4 border-b border-border">
          <EquipmentHeader
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            category={category}
            onCategoryChange={handleCategoryChange}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Scrollable equipment list */}
        <div className="flex-1 overflow-y-auto">
          <EquipmentList
            equipment={equipment}
            selectedEquipmentId={selectedEquipmentId}
            isLoading={isLoading}
            isError={isError}
            onEquipmentClick={handleEquipmentClick}
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={fetchNextPage}
            refetch={refetch}
          />
        </div>
      </div>

      {/* Right Panel - Equipment Details (70% width) */}
      <div className="w-[70%] flex flex-col">
        {selectedEquipment ? (
          <>
            {/* Equipment header */}
            <div className="p-6 border-b border-border bg-gradient-to-r from-card via-card/80 to-emerald-500/5">
              <h2 className="text-3xl font-bold mb-3">{selectedEquipment.data.name[selectedLanguage]}</h2>
              {selectedLanguage === 'en' &&
                selectedEquipment.data.name.pl !== selectedEquipment.data.name.en && (
                  <p className="text-sm text-muted-foreground italic mb-3">{selectedEquipment.data.name.pl}</p>
                )}
              {selectedLanguage === 'pl' &&
                selectedEquipment.data.name.en !== selectedEquipment.data.name.pl && (
                  <p className="text-sm text-muted-foreground italic mb-3">{selectedEquipment.data.name.en}</p>
                )}
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 text-sm shadow-sm">
                  {getPrimaryCategory(selectedEquipment.data.equipment_categories)}
                </Badge>
                {formatCost(selectedEquipment.data.cost) && (
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    {formatCost(selectedEquipment.data.cost)}
                  </Badge>
                )}
                {selectedEquipment.data.weight !== undefined && (
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    {selectedEquipment.data.weight} lb
                  </Badge>
                )}
              </div>
            </div>

            {/* Scrollable equipment details */}
            <ScrollArea className="flex-1 p-6">
              <EquipmentDetails data={selectedEquipment.data} />
            </ScrollArea>
          </>
        ) : (
          // Empty state when no equipment is selected
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <FileSearch className="h-16 w-16 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Equipment Selected</h3>
            <p className="text-sm">Select an item from the list to view its details</p>
          </div>
        )}
      </div>
    </div>
  );
}
