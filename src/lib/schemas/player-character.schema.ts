import { z } from "zod";

/**
 * Schema for character form dialog (create/edit basic info)
 * Simplified form with just name, class, level, race, status
 */
export const characterFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be 255 characters or less").trim(),
  class: z.string().max(100, "Class must be 100 characters or less").trim().nullable().optional(),
  level: z.number().int().min(1, "Level must be at least 1").max(20, "Level cannot exceed 20").nullable().optional(),
  race: z.string().max(100, "Race must be 100 characters or less").trim().nullable().optional(),
  status: z.enum(['active', 'retired', 'deceased']),
});

export type CharacterFormData = z.infer<typeof characterFormSchema>;
