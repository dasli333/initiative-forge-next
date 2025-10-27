import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Plus } from "lucide-react";
import type { MonsterViewModel } from "../types";

interface MonsterCardProps {
  monster: MonsterViewModel;
  onAdd: (monsterId: string, monsterName: string) => void;
}

export function MonsterCard({ monster, onAdd }: MonsterCardProps) {
  return (
    <AccordionItem data-testid={`monster-card-${monster.name}`} value={monster.id} className="border-border">
      <div className="flex items-center justify-between pr-4 hover:bg-accent/50 transition-colors">
        <AccordionTrigger className="flex-1 hover:no-underline px-4 py-3">
          <div className="flex items-center gap-3 text-left flex-wrap">
            <span className="font-medium">{monster.name}</span>
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-0.5 text-xs shadow-sm">
              CR {monster.cr}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {monster.size} {monster.type}
            </span>
          </div>
        </AccordionTrigger>
        <Button
          data-testid={`add-monster-${monster.name}`}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onAdd(monster.id, monster.name);
          }}
          className="ml-2"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <AccordionContent className="px-4 pb-4 bg-muted/30">
        <div className="space-y-3 text-sm">
          <div className="flex gap-4 flex-wrap">
            <div>
              <span className="font-medium">HP:</span> <span className="text-muted-foreground">{monster.hp}</span>
            </div>
            <div>
              <span className="font-medium">AC:</span> <span className="text-muted-foreground">{monster.ac}</span>
            </div>
            <div>
              <span className="font-medium">Speed:</span>{" "}
              <span className="text-muted-foreground">{monster.speed.join(", ")}</span>
            </div>
          </div>

          {monster.actions.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Actions</h4>
              <ul className="space-y-1">
                {monster.actions.slice(0, 3).map((action, idx) => (
                  <li key={idx} className="text-muted-foreground">
                    <span className="font-medium text-foreground">{action.name}:</span> {action.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
