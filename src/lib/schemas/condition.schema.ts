import { z } from "zod";
import { LocalizedNameSchema } from "./shared.schema";

/**
 * Condition schema - D&D 5e condition with localized names
 */
export const ConditionSchema = z.object({
  id: z.string(), // Text ID from JSON (e.g., 'blinded', 'charmed')
  name: LocalizedNameSchema, // Localized name: { en: string, pl: string }
  description: z.string(),
});

export type Condition = z.infer<typeof ConditionSchema>;

/**
 * Schema for listing conditions response
 */
export const ListConditionsResponseSchema = z.object({
  conditions: z.array(ConditionSchema),
});

export type ListConditionsResponse = z.infer<typeof ListConditionsResponseSchema>;
