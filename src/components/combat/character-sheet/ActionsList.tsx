// List of available actions for active character

import type { ActionDTO } from "@/types";
import { ActionButton } from "./ActionButton";

interface ActionsListProps {
  actions: ActionDTO[];
  onActionClick: (action: ActionDTO) => void;
}

export function ActionsList({ actions, onActionClick }: ActionsListProps) {
  if (actions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No actions available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-w-full overflow-hidden min-w-0">
      {actions.map((action, index) => (
        <ActionButton key={`${action.name}-${index}`} action={action} onClick={onActionClick} />
      ))}
    </div>
  );
}
