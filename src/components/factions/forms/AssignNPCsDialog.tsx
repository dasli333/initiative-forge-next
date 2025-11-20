'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { NPCDTO } from '@/types/npcs';

interface AssignNPCsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (npcIds: string[]) => void;
  factionId: string;
  currentMembers: NPCDTO[];
  availableNPCs: NPCDTO[];
  isSubmitting?: boolean;
}

/**
 * Dialog for assigning NPCs to a faction
 * - Shows checkboxes for all NPCs without a faction OR with current faction
 * - Search input to filter by name
 * - Multi-select with submit
 */
export function AssignNPCsDialog({
  isOpen,
  onClose,
  onSubmit,
  factionId,
  currentMembers: _currentMembers,
  availableNPCs,
  isSubmitting = false,
}: AssignNPCsDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNpcIds, setSelectedNpcIds] = useState<string[]>([]);

  // Filter NPCs: show only unassigned OR current faction members
  const filteredNPCs = useMemo(() => {
    return availableNPCs.filter(npc => {
      // Include if: no faction OR current faction
      const isEligible = !npc.faction_id || npc.faction_id === factionId;
      if (!isEligible) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return npc.name.toLowerCase().includes(query) ||
               npc.role?.toLowerCase().includes(query);
      }

      return true;
    });
  }, [availableNPCs, factionId, searchQuery]);

  const handleToggle = (npcId: string) => {
    setSelectedNpcIds(prev =>
      prev.includes(npcId)
        ? prev.filter(id => id !== npcId)
        : [...prev, npcId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNpcIds.length === filteredNPCs.length) {
      setSelectedNpcIds([]);
    } else {
      setSelectedNpcIds(filteredNPCs.map(npc => npc.id));
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedNpcIds([]);
    onClose();
  };

  const handleSubmit = () => {
    onSubmit(selectedNpcIds);
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign NPCs</DialogTitle>
          <DialogDescription>
            Select NPCs to assign to this faction.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div>
            <Input
              placeholder="Search NPCs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Select All */}
          {filteredNPCs.length > 0 && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedNpcIds.length === filteredNPCs.length && filteredNPCs.length > 0}
                onCheckedChange={handleSelectAll}
                disabled={isSubmitting}
              />
              <Label
                htmlFor="select-all"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Select all ({filteredNPCs.length})
              </Label>
            </div>
          )}

          {/* NPC List */}
          <ScrollArea className="h-[300px] border rounded-md p-4">
            {filteredNPCs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {searchQuery ? 'No NPCs match your search.' : 'No available NPCs.'}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredNPCs.map((npc) => (
                  <div
                    key={npc.id}
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                    onClick={() => handleToggle(npc.id)}
                  >
                    <Checkbox
                      checked={selectedNpcIds.includes(npc.id)}
                      onCheckedChange={() => handleToggle(npc.id)}
                      disabled={isSubmitting}
                    />
                    <Avatar className="w-8 h-8">
                      {npc.image_url && (
                        <AvatarImage src={npc.image_url} alt={npc.name} />
                      )}
                      <AvatarFallback>
                        {npc.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{npc.name}</p>
                      {npc.role && (
                        <p className="text-xs text-muted-foreground truncate">{npc.role}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Selected Count */}
          <p className="text-sm text-muted-foreground">
            {selectedNpcIds.length} NPC{selectedNpcIds.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={selectedNpcIds.length === 0 || isSubmitting}
          >
            {isSubmitting ? 'Assigning...' : `Assign ${selectedNpcIds.length} NPC${selectedNpcIds.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
