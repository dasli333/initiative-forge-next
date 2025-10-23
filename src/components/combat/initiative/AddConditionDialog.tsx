// Dialog for adding a condition to a combat participant

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ConditionDTO } from "@/types";

interface AddConditionDialogProps {
  isOpen: boolean;
  participantName: string;
  conditions: ConditionDTO[];
  existingConditionIds: string[]; // To prevent duplicates
  onAdd: (conditionId: string, duration: number | null) => void;
  onCancel: () => void;
}

export function AddConditionDialog({
  isOpen,
  participantName,
  conditions,
  existingConditionIds,
  onAdd,
  onCancel,
}: AddConditionDialogProps) {
  const [selectedConditionId, setSelectedConditionId] = useState<string>("");
  const [duration, setDuration] = useState<string>(""); // Empty string = indefinite

  const handleAdd = () => {
    if (!selectedConditionId) return;

    const durationValue = duration === "" ? null : parseInt(duration, 10);
    onAdd(selectedConditionId, durationValue);

    // Reset form
    setSelectedConditionId("");
    setDuration("");
  };

  const handleCancel = () => {
    setSelectedConditionId("");
    setDuration("");
    onCancel();
  };

  // Filter out conditions that are already applied
  const availableConditions = conditions.filter((c) => !existingConditionIds.includes(c.id));

  const selectedCondition = conditions.find((c) => c.id === selectedConditionId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Condition</DialogTitle>
          <DialogDescription>Add a condition to {participantName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Condition Select */}
          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <Select value={selectedConditionId} onValueChange={setSelectedConditionId}>
              <SelectTrigger id="condition">
                <SelectValue placeholder="Select a condition" />
              </SelectTrigger>
              <SelectContent>
                {availableConditions.length === 0 ? (
                  <div className="p-2 text-center text-sm text-muted-foreground">All conditions already applied</div>
                ) : (
                  availableConditions.map((condition) => (
                    <SelectItem key={condition.id} value={condition.id}>
                      {condition.name.pl}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Duration Input */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (rounds)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="99"
              placeholder="Indefinite"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Leave empty for indefinite duration</p>
          </div>

          {/* Condition Description Preview */}
          {selectedCondition && (
            <div className="rounded-md border p-3 bg-muted/30">
              <p className="text-sm font-semibold mb-1">{selectedCondition.name.pl}</p>
              <p className="text-xs text-muted-foreground line-clamp-3">{selectedCondition.description}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!selectedConditionId || availableConditions.length === 0}>
            Add Condition
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
