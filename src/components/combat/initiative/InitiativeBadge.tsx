// Badge displaying initiative value

import { Badge } from "@/components/ui/badge";

interface InitiativeBadgeProps {
  value: number | null;
}

export function InitiativeBadge({ value }: InitiativeBadgeProps) {
  return (
    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20" data-testid="initiative-badge">
      {value !== null ? value : "-"}
    </Badge>
  );
}
