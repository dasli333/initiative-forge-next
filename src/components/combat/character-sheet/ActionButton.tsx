// Button for executing an action (attack, spell, etc.)

import { Button } from "@/components/ui/button";
import { AttackBadge, DamageBadge } from "@/components/library";
import { Sword, Wand2, Zap } from "lucide-react";
import type { ActionDTO } from "@/types";

interface ActionButtonProps {
  action: ActionDTO;
  onClick: (action: ActionDTO) => void;
}

export function ActionButton({ action, onClick }: ActionButtonProps) {
  // Icon based on action type
  const Icon = action.type === "melee" ? Sword : action.type === "ranged" ? Zap : Wand2;

  return (
    <Button
      variant="outline"
      className="w-full justify-start gap-3 h-auto py-3 overflow-hidden transition-colors hover:bg-transparent hover:border-emerald-500 hover:shadow-sm"
      onClick={() => onClick(action)}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <div className="flex-1 text-left overflow-hidden min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold">{action.name}</p>
          {action.attack_bonus !== undefined && action.attack_bonus !== null && (
            <AttackBadge bonus={action.attack_bonus} />
          )}
          {action.damage &&
            action.damage.length > 0 &&
            action.damage.map((dmg, index) => (
              <DamageBadge key={index} average={dmg.average} formula={dmg.formula} type={dmg.type} />
            ))}
        </div>
        {action.description && (
          <p className="w-full text-xs text-muted-foreground line-clamp-3 leading-relaxed mt-1 break-words whitespace-normal">
            {action.description}
          </p>
        )}
      </div>
    </Button>
  );
}
