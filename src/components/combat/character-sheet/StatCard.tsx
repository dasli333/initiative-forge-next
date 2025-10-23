// Single ability score card (STR, DEX, etc.)

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatCardProps {
  name: string; // "STR", "DEX", etc.
  score: number;
  modifier: number;
}

export function StatCard({ name, score, modifier }: StatCardProps) {
  const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;

  return (
    <Card>
      <CardContent className="p-4 text-center space-y-2">
        <p className="text-xs text-muted-foreground font-semibold">{name}</p>
        <p className="text-2xl font-bold">{score}</p>
        <Badge variant="secondary">{modifierText}</Badge>
      </CardContent>
    </Card>
  );
}
