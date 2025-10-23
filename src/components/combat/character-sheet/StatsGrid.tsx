// Compact table display of 6 ability scores

import type { StatsDTO } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculateModifier } from "@/lib/dice";

interface StatsGridProps {
  stats: StatsDTO;
}

/**
 * Formats modifier with +/- prefix
 */
function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const abilities = [
    { name: "STR", score: stats.str, modifier: calculateModifier(stats.str) },
    { name: "DEX", score: stats.dex, modifier: calculateModifier(stats.dex) },
    { name: "CON", score: stats.con, modifier: calculateModifier(stats.con) },
    { name: "INT", score: stats.int, modifier: calculateModifier(stats.int) },
    { name: "WIS", score: stats.wis, modifier: calculateModifier(stats.wis) },
    { name: "CHA", score: stats.cha, modifier: calculateModifier(stats.cha) },
  ];

  return (
    <div className="rounded-lg overflow-hidden border border-border/50 w-full">
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {abilities.map((ability) => (
              <TableHead key={ability.name} className="text-center font-semibold w-[16.666%]">
                {ability.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="hover:bg-muted/30 transition-colors">
            {abilities.map((ability) => (
              <TableCell key={ability.name} className="text-center py-3">
                <div className="font-medium text-base">{ability.score}</div>
                <span className={`text-xs font-medium ${ability.modifier >= 0 ? "text-emerald-500" : "text-red-400"}`}>
                  ({formatModifier(ability.modifier)})
                </span>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
