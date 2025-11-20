'use client';

import Image from 'next/image';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NPCDTO } from '@/types/npcs';

interface MembersTabProps {
  members: NPCDTO[];
  onAssignMembersClick: () => void;
  onUnassignMember: (npcId: string) => void;
  isUpdating?: boolean;
}

export function MembersTab({
  members,
  onAssignMembersClick,
  onUnassignMember,
  isUpdating = false,
}: MembersTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Members ({members.length})
        </h3>
        <Button
          size="sm"
          onClick={onAssignMembersClick}
          disabled={isUpdating}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Assign NPCs
        </Button>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No members yet</p>
          <p className="text-xs mt-1">Use "Assign NPCs" to add members to this faction</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {members.map((npc) => (
            <div
              key={npc.id}
              className="group relative flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              {npc.image_url ? (
                <Image
                  src={npc.image_url}
                  alt={npc.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-md object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{npc.name}</div>
                {npc.role && (
                  <div className="text-xs text-muted-foreground truncate">{npc.role}</div>
                )}
              </div>
              <button
                onClick={() => onUnassignMember(npc.id)}
                disabled={isUpdating}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-destructive hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
