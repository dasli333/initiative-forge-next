// Header for active character sheet with name and AC

import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CharacterHeaderProps {
  name: string;
  currentHP: number;
  maxHP: number;
  armorClass: number;
}

export function CharacterHeader({ name, armorClass }: CharacterHeaderProps) {
  return (
    <div className="p-6 border-b border-border bg-gradient-to-r from-card via-card/80 to-emerald-500/5">
      <div className="flex items-start justify-between gap-3 min-w-0">
        <h2 className="text-3xl font-bold truncate min-w-0 flex-1">{name}</h2>
        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 text-base shadow-sm flex-shrink-0">
          <Shield className="h-4 w-4 mr-1.5 inline" />
          AC {armorClass}
        </Badge>
      </div>
    </div>
  );
}
