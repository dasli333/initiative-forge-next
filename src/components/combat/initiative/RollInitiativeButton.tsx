// Button to roll initiative for all participants

import { Button } from "@/components/ui/button";
import { Dices } from "lucide-react";

interface RollInitiativeButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function RollInitiativeButton({ onClick, disabled = false }: RollInitiativeButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled} className="w-full" variant="outline">
      <Dices className="mr-2 h-4 w-4" />
      Roll Initiative
    </Button>
  );
}
