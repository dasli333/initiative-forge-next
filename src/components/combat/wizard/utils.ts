/**
 * @deprecated This file is deprecated and maintained only for backward compatibility.
 * Please import from @/lib/combat-wizard instead.
 *
 * This file will be removed in a future version.
 */

// Re-export all functions from the new modular structure
export {
  defaultAdvancedNPCFormData,
  defaultSimpleNPCFormData,
  generateDefaultCombatName,
  advancedFormToAdHocNPC,
  mapWizardStateToCommand,
  simpleFormToAdHocNPC,
  validateAdvancedNPCForm,
  validateSimpleNPCForm,
  validateStep1,
  validateStep2,
  validateStep5,
} from "@/lib/combat-wizard";
