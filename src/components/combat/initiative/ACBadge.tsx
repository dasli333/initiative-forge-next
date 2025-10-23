// Badge displaying Armor Class with shield icon

import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

interface ACBadgeProps {
  value: number;
}

export function ACBadge({ value }: ACBadgeProps) {
  return (
    <Badge variant="secondary" className="gap-1">
      <Shield className="h-3 w-3" />
      {value}
    </Badge>
  );
}
