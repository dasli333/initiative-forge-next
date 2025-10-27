import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { AdHocNPC } from "../types";

/**
 * Props for AddedNPCCard component
 */
interface AddedNPCCardProps {
  /**
   * NPC to display
   */
  npc: AdHocNPC;
  /**
   * Callback when remove button is clicked
   */
  onRemove: (npcId: string) => void;
}

/**
 * Card component displaying an added NPC in the sidebar
 */
export function AddedNPCCard({ npc, onRemove }: AddedNPCCardProps) {
  return (
    <div className="flex items-start justify-between p-3 bg-gradient-to-r from-card via-card/80 to-emerald-500/5 rounded-lg border border-border shadow-sm">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{npc.display_name}</p>
        <div className="flex gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            HP: {npc.max_hp}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            AC: {npc.armor_class}
          </Badge>
        </div>
      </div>

      <Button size="sm" variant="ghost" onClick={() => onRemove(npc.id)} className="h-8 w-8 p-0 flex-shrink-0">
        <X className="w-4 h-4" />
        <span className="sr-only">Remove {npc.display_name}</span>
      </Button>
    </div>
  );
}
