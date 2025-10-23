import { CombatCreationWizard } from "./CombatCreationWizard";

interface CombatCreationWizardWrapperProps {
  campaignId: string;
}

/**
 * Wrapper component for the Combat Creation Wizard
 * Note: In Next.js SPA mode, QueryClient is provided at root level
 * so no additional providers or hydration are needed here
 *
 * @deprecated Use CombatCreationWizard directly - this wrapper is no longer needed
 */
export function CombatCreationWizardWrapper({ campaignId }: CombatCreationWizardWrapperProps) {
  return <CombatCreationWizard campaignId={campaignId} />;
}
