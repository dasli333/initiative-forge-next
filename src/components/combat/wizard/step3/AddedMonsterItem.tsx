import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useInlineEdit } from "@/hooks/useInlineEdit";
import type { AddedMonsterViewModel } from "../types";

interface AddedMonsterItemProps {
  monster: AddedMonsterViewModel;
  onUpdateCount: (monsterId: string, count: number) => void;
  onRemove: (monsterId: string) => void;
}

export function AddedMonsterItem({ monster, onUpdateCount, onRemove }: AddedMonsterItemProps) {
  const countEdit = useInlineEdit({
    initialValue: monster.count.toString(),
    onSubmit: (value) => {
      const newCount = parseInt(value, 10);
      if (!isNaN(newCount) && newCount >= 1) {
        onUpdateCount(monster.monster_id, newCount);
      }
    },
    validator: (value) => {
      const num = parseInt(value, 10);
      return !isNaN(num) && num >= 1;
    },
  });

  return (
    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-card via-card/80 to-emerald-500/5 rounded-lg border border-border shadow-sm">
      <div className="flex-1">
        <span className="font-medium">{monster.name}</span>
      </div>

      <div className="flex items-center gap-2">
        {countEdit.isEditing ? (
          <Input
            ref={countEdit.inputRef}
            data-testid={`monster-count-${monster.name}`}
            type="number"
            min="1"
            value={countEdit.editValue}
            onChange={(e) => countEdit.setValue(e.target.value)}
            onBlur={countEdit.handleSubmit}
            onKeyDown={countEdit.handleKeyDown}
            className="w-16 h-8 text-center"
          />
        ) : (
          <Badge
            data-testid={`monster-count-${monster.name}`}
            variant="secondary"
            className="cursor-pointer hover:bg-accent"
            onClick={countEdit.startEditing}
          >
            x{monster.count}
          </Badge>
        )}

        <Button size="sm" variant="ghost" onClick={() => onRemove(monster.monster_id)} className="h-8 w-8 p-0">
          <X className="w-4 h-4" />
          <span className="sr-only">Remove {monster.name}</span>
        </Button>
      </div>
    </div>
  );
}
