// Reference panel (right column) with roll controls and reference tabs

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Search } from "lucide-react";
import type { ConditionDTO } from "@/types";
import type { RollMode, RollResult } from "@/types/combat-view.types";
import { ConditionsTab } from "./ConditionsTab";
import { RollControls } from "../character-sheet/RollControls";
import { RollLog } from "../character-sheet/RollLog";
import { GradientSeparator } from "@/components/library";

interface ReferencePanelProps {
  conditions: ConditionDTO[];
  // Roll controls props
  rollMode: RollMode;
  recentRolls: RollResult[];
  onRollModeChange: (mode: RollMode) => void;
}

export function ReferencePanel({ conditions, rollMode, recentRolls, onRollModeChange }: ReferencePanelProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConditions = conditions.filter((condition) => {
    const search = searchTerm.toLowerCase();
    return condition.name.en.toLowerCase().includes(search) || condition.name.pl.toLowerCase().includes(search);
  });

  return (
    <div className="flex flex-col h-full border-l">
      {/* Top Section: Roll Controls & Roll Log - 50% height */}
      <div className="h-1/2 flex flex-col border-b">
        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
          {/* Roll Controls */}
          <div className="flex-shrink-0">
            <RollControls value={rollMode} onChange={onRollModeChange} />
          </div>

          <GradientSeparator />

          {/* Roll Log - scrollable */}
          <div className="flex-1 overflow-y-auto">
            <RollLog rolls={recentRolls} />
          </div>
        </div>
      </div>

      {/* Bottom Section: Reference Tabs - 50% height */}
      <div className="h-1/2 flex flex-col overflow-hidden">
        {/* Search Bar */}
        <div className="flex-shrink-0 p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              maxLength={100}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="conditions" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="flex-shrink-0 w-full grid grid-cols-3">
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="spells">Spells</TabsTrigger>
            <TabsTrigger value="monsters">Monsters</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="conditions" className="p-4 mt-0">
              <ConditionsTab conditions={filteredConditions} />
            </TabsContent>

            <TabsContent value="spells" className="p-4 mt-0">
              <div className="text-center text-muted-foreground">
                <p className="text-sm">Spells tab - coming soon</p>
              </div>
            </TabsContent>

            <TabsContent value="monsters" className="p-4 mt-0">
              <div className="text-center text-muted-foreground">
                <p className="text-sm">Monsters tab - coming soon</p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
