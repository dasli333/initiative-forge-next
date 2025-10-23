'use client';

import { CombatCreationWizard } from '@/components/combat/wizard/CombatCreationWizard';

interface NewCombatPageClientProps {
  campaignId: string;
}

/**
 * Combat creation page client component
 * Uses the full 5-step wizard for creating combats with:
 * - Step 1: Combat Name
 * - Step 2: Select Player Characters
 * - Step 3: Add Monsters (with search and filtering)
 * - Step 4: Add NPCs (simple and advanced modes)
 * - Step 5: Summary and confirmation
 */
export function NewCombatPageClient({ campaignId }: NewCombatPageClientProps) {
  return <CombatCreationWizard campaignId={campaignId} />;
}
