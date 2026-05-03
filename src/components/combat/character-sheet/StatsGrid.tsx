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
      {/* Mobile: 3-col grid */}
      <div className="grid grid-cols-3 sm:hidden">
        {abilities.map((ability) => (
          <div key={ability.name} className="flex flex-col items-center justify-center py-2 border-b border-r border-border/50 last:border-r-0 [&:nth-child(3n)]:border-r-0 [&:nth-last-child(-n+3)]:border-b-0">
            <div className="text-xs font-semibold text-muted-foreground">{ability.name}</div>
            <div className="font-medium text-base">{ability.score}</div>
            <span className={`text-xs font-medium ${ability.modifier >= 0 ? "text-emerald-500" : "text-red-400"}`}>
              ({formatModifier(ability.modifier)})
            </span>
          </div>
        ))}
      </div>
      {/* sm+: table */}
      <Table className="hidden sm:table table-fixed w-full">
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
