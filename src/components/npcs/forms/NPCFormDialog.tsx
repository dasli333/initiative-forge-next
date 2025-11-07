'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { uploadNPCImage, deleteNPCImage } from '@/lib/api/storage';
import { npcFormSchema, type NPCFormData } from '@/lib/schemas/npcs';
import type { JSONContent } from '@tiptap/core';

interface NPCFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NPCFormData) => void;
  campaignId: string;
  factions: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
  mode: 'create' | 'edit';
  initialData?: Partial<NPCFormData>;
  isSubmitting?: boolean;
}

/**
 * Multi-step form dialog for creating/editing NPCs
 * - Step 1: Basic Info (name*, role, faction, location, status, image)
 * - Step 2: Story (biography RichTextEditor, personality RichTextEditor)
 * - Step 3: Combat (optional, checkbox enables form)
 * - Navigation: Back/Next/Cancel/Submit
 */
export function NPCFormDialog({
  isOpen,
  onClose,
  onSubmit,
  campaignId,
  factions,
  locations,
  mode,
  initialData,
  isSubmitting = false,
}: NPCFormDialogProps) {
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
    reset,
  } = useForm<NPCFormData>({
    resolver: zodResolver(npcFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      role: initialData?.role || '',
      faction_id: initialData?.faction_id || null,
      current_location_id: initialData?.current_location_id || null,
      status: initialData?.status || 'alive',
      image_url: initialData?.image_url || null,
      biography_json: initialData?.biography_json || null,
      personality_json: initialData?.personality_json || null,
      addCombatStats: initialData?.addCombatStats || false,
      combatStats: initialData?.combatStats || null,
    },
  });

  const addCombatStats = watch('addCombatStats');
  const factionId = watch('faction_id');
  const locationId = watch('current_location_id');
  const status = watch('status');

  const handleClose = () => {
    reset();
    setStep(1);
    onClose();
  };

  const handleNext = async () => {
    let fieldsToValidate: (keyof NPCFormData)[] = [];

    if (step === 1) {
      fieldsToValidate = ['name', 'status'];
    }
    // Step 2: skip validation (fields are optional)

    const isValid = fieldsToValidate.length > 0
      ? await trigger(fieldsToValidate)
      : true;

    if (isValid && step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFormSubmit = (data: NPCFormData) => {
    onSubmit(data);
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New NPC' : 'Edit NPC'}
          </DialogTitle>
          <DialogDescription>
            Step {step} of 3
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => {
          e.preventDefault();
          // Never auto-submit - only via button click
        }} className="space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter NPC name"
                />
                {errors.name && (
                  <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  {...register('role')}
                  placeholder="e.g., Merchant, Guard Captain"
                />
                {errors.role && (
                  <p className="text-xs text-destructive mt-1">{errors.role.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="faction">Faction</Label>
                <Select
                  value={factionId || 'none'}
                  onValueChange={(value) => setValue('faction_id', value === 'none' ? null : value)}
                >
                  <SelectTrigger id="faction">
                    <SelectValue placeholder="Select faction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No faction</SelectItem>
                    {factions.map((faction) => (
                      <SelectItem key={faction.id} value={faction.id}>
                        {faction.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Current Location</Label>
                <Select
                  value={locationId || 'none'}
                  onValueChange={(value) => setValue('current_location_id', value === 'none' ? null : value)}
                >
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No location</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setValue('status', value as 'alive' | 'dead' | 'unknown')}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alive">Alive</SelectItem>
                    <SelectItem value="dead">Dead</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Image</Label>
                <ImageUpload
                  value={watch('image_url')}
                  onChange={(url) => setValue('image_url', url)}
                  campaignId={campaignId}
                  maxSizeMB={5}
                />
              </div>
            </div>
          )}

          {/* Step 2: Story */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Biography</Label>
                <RichTextEditor
                  value={watch('biography_json') as JSONContent}
                  onChange={(content) => setValue('biography_json', content)}
                  campaignId={campaignId}
                  placeholder="Write the NPC's backstory..."
                />
              </div>

              <div>
                <Label>Personality</Label>
                <RichTextEditor
                  value={watch('personality_json') as JSONContent}
                  onChange={(content) => setValue('personality_json', content)}
                  campaignId={campaignId}
                  placeholder="Describe personality traits..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Combat */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="addCombatStats"
                  checked={addCombatStats}
                  onCheckedChange={(checked) => setValue('addCombatStats', checked as boolean)}
                />
                <Label htmlFor="addCombatStats" className="cursor-pointer">
                  Add combat statistics
                </Label>
              </div>

              {addCombatStats && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="hp_max">HP Max *</Label>
                      <Input
                        id="hp_max"
                        type="number"
                        {...register('combatStats.hp_max', { valueAsNumber: true })}
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="armor_class">AC *</Label>
                      <Input
                        id="armor_class"
                        type="number"
                        {...register('combatStats.armor_class', { valueAsNumber: true })}
                        placeholder="15"
                      />
                    </div>
                    <div>
                      <Label htmlFor="speed">Speed *</Label>
                      <Input
                        id="speed"
                        type="number"
                        {...register('combatStats.speed', { valueAsNumber: true })}
                        placeholder="30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="strength">STR *</Label>
                      <Input
                        id="strength"
                        type="number"
                        {...register('combatStats.strength', { valueAsNumber: true })}
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dexterity">DEX *</Label>
                      <Input
                        id="dexterity"
                        type="number"
                        {...register('combatStats.dexterity', { valueAsNumber: true })}
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="constitution">CON *</Label>
                      <Input
                        id="constitution"
                        type="number"
                        {...register('combatStats.constitution', { valueAsNumber: true })}
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="intelligence">INT *</Label>
                      <Input
                        id="intelligence"
                        type="number"
                        {...register('combatStats.intelligence', { valueAsNumber: true })}
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="wisdom">WIS *</Label>
                      <Input
                        id="wisdom"
                        type="number"
                        {...register('combatStats.wisdom', { valueAsNumber: true })}
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="charisma">CHA *</Label>
                      <Input
                        id="charisma"
                        type="number"
                        {...register('combatStats.charisma', { valueAsNumber: true })}
                        placeholder="10"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Actions can be added after creating the NPC in the Combat tab.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <DialogFooter>
            <div className="flex justify-between w-full">
              <div className="flex gap-2">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                )}
                <Button type="button" variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
              </div>

              <div className="flex gap-2">
                {step < 3 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => handleSubmit(handleFormSubmit)()}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : mode === 'create' ? 'Create NPC' : 'Save Changes'}
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
