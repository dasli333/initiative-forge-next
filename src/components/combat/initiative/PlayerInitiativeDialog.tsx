// Dialog for manually entering initiative for player characters

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CombatParticipantDTO } from "@/types";
import { calculateModifier } from "@/lib/dice";

interface PlayerInitiativeDialogProps {
  open: boolean;
  participants: CombatParticipantDTO[]; // PC participants only
  onConfirm: (entries: { id: string; initiative: number }[]) => void;
  onCancel: () => void;
}

export function PlayerInitiativeDialog({
  open,
  participants,
  onConfirm,
  onCancel,
}: PlayerInitiativeDialogProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset values when dialog opens
  useEffect(() => {
    if (open) {
      setValues({});
      inputRefs.current = [];
    }
  }, [open]);

  // Auto-focus first input when dialog opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRefs.current[0]?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (index < participants.length - 1) {
          inputRefs.current[index + 1]?.focus();
        } else {
          handleConfirm();
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [participants.length, values]
  );

  const handleConfirm = () => {
    const entries = participants.map((p) => {
      const raw = parseInt(values[p.id] || "0", 10);
      const dexMod = calculateModifier(p.stats.dex);
      return { id: p.id, initiative: (isNaN(raw) ? 0 : raw) + dexMod };
    });
    onConfirm(entries);
  };

  const allFilled = participants.every((p) => {
    const v = values[p.id];
    return v !== undefined && v !== "" && !isNaN(parseInt(v, 10));
  });

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Player Initiative</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {participants.map((p, index) => {
            const dexMod = calculateModifier(p.stats.dex);
            const sign = dexMod >= 0 ? "+" : "";
            return (
              <div key={p.id} className="flex items-center gap-3">
                <Label className="w-32 truncate text-sm font-medium" title={p.display_name}>
                  {p.display_name}
                </Label>
                <Input
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="number"
                  placeholder="d20"
                  className="w-20 text-center"
                  value={values[p.id] ?? ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  min={1}
                  max={20}
                  data-testid={`initiative-input-${p.display_name}`}
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {sign}{dexMod} DEX
                </span>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Auto-roll
          </Button>
          <Button onClick={handleConfirm} disabled={!allFilled}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
