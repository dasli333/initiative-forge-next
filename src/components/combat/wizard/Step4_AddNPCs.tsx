import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SimpleNPCForm } from "./npc-forms/SimpleNPCForm";
import { AdvancedNPCForm } from "./npc-forms/AdvancedNPCForm";
import { AddedNPCCard } from "./npc-forms/AddedNPCCard";
import type { Step4Props, SimpleNPCFormData, AdvancedNPCFormData } from "./types";

export function Step4_AddNPCs({
  mode,
  onModeChange,
  npcForm,
  onFormChange,
  onAddNPC,
  addedNPCs,
  onRemoveNPC,
  onBack,
  onNext,
  isFormValid,
}: Step4Props) {
  const handleModeToggle = useCallback(
    (checked: boolean) => {
      const newMode = checked ? "advanced" : "simple";
      // TODO: Add confirmation modal if form has data
      onModeChange(newMode);
    },
    [onModeChange]
  );

  return (
    <div className="max-w-5xl mx-auto">
      <h2 id="step-4-heading" className="text-2xl font-bold mb-6" tabIndex={-1}>
        Add NPCs (Optional)
      </h2>

      <p className="text-muted-foreground mb-6">
        Create custom NPCs for this combat. You can skip this step if not needed.
      </p>

      {/* Mode Toggle */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-muted/50 rounded-lg border border-border">
        <Label htmlFor="mode-toggle" className="font-medium">
          Simple Mode
        </Label>
        <Switch id="mode-toggle" checked={mode === "advanced"} onCheckedChange={handleModeToggle} />
        <Label htmlFor="mode-toggle" className="font-medium">
          Advanced Mode
        </Label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* NPC Form */}
        <div className="lg:col-span-2">
          {mode === "simple" ? (
            <SimpleNPCForm
              form={npcForm as SimpleNPCFormData}
              onChange={onFormChange}
              onAdd={onAddNPC}
              isValid={isFormValid}
            />
          ) : (
            <AdvancedNPCForm
              form={npcForm as AdvancedNPCFormData}
              onChange={onFormChange}
              onAdd={onAddNPC}
              isValid={isFormValid}
            />
          )}
        </div>

        {/* Added NPCs List */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 border border-border rounded-lg p-4 bg-card shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Added NPCs ({addedNPCs.length})</h3>

            {addedNPCs.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p className="text-sm">No NPCs added yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {addedNPCs.map((npc) => (
                  <AddedNPCCard key={npc.id} npc={npc} onRemove={onRemoveNPC} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button data-testid="wizard-back-button" onClick={onBack} variant="outline" size="lg">
          Back
        </Button>
        <Button data-testid="wizard-next-button" onClick={onNext} size="lg">
          Next
        </Button>
      </div>
    </div>
  );
}
