import { z } from "zod";
import { PlayerCharacterActionSchema } from "./action.schema";

/**
 * Schema for creating a new player character
 * Validates all required D&D 5e stats and optional actions
 */
export const CreatePlayerCharacterCommandSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be 255 characters or less").trim(),

  max_hp: z.number().int().positive("Max HP must be greater than 0").max(32767, "Max HP exceeds maximum value"),

  armor_class: z
    .number()
    .int()
    .positive("Armor class must be greater than 0")
    .max(32767, "Armor class exceeds maximum value"),

  speed: z.number().int().nonnegative("Speed cannot be negative").max(32767, "Speed exceeds maximum value"),

  strength: z.number().int().min(1, "Strength must be at least 1").max(30, "Strength cannot exceed 30"),

  dexterity: z.number().int().min(1, "Dexterity must be at least 1").max(30, "Dexterity cannot exceed 30"),

  constitution: z.number().int().min(1, "Constitution must be at least 1").max(30, "Constitution cannot exceed 30"),

  intelligence: z.number().int().min(1, "Intelligence must be at least 1").max(30, "Intelligence cannot exceed 30"),

  wisdom: z.number().int().min(1, "Wisdom must be at least 1").max(30, "Wisdom cannot exceed 30"),

  charisma: z.number().int().min(1, "Charisma must be at least 1").max(30, "Charisma cannot exceed 30"),

  actions: z.array(PlayerCharacterActionSchema).max(20, "Maximum 20 actions allowed").optional(),
});

export type CreatePlayerCharacterCommand = z.infer<typeof CreatePlayerCharacterCommandSchema>;

/**
 * Schema for updating a player character
 * All fields are optional for partial updates
 */
export const UpdatePlayerCharacterCommandSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").max(255, "Name must be 255 characters or less").trim().optional(),

  max_hp: z
    .number()
    .int()
    .positive("Max HP must be greater than 0")
    .max(32767, "Max HP exceeds maximum value")
    .optional(),

  armor_class: z
    .number()
    .int()
    .positive("Armor class must be greater than 0")
    .max(32767, "Armor class exceeds maximum value")
    .optional(),

  speed: z.number().int().nonnegative("Speed cannot be negative").max(32767, "Speed exceeds maximum value").optional(),

  strength: z.number().int().min(1, "Strength must be at least 1").max(30, "Strength cannot exceed 30").optional(),

  dexterity: z.number().int().min(1, "Dexterity must be at least 1").max(30, "Dexterity cannot exceed 30").optional(),

  constitution: z
    .number()
    .int()
    .min(1, "Constitution must be at least 1")
    .max(30, "Constitution cannot exceed 30")
    .optional(),

  intelligence: z
    .number()
    .int()
    .min(1, "Intelligence must be at least 1")
    .max(30, "Intelligence cannot exceed 30")
    .optional(),

  wisdom: z.number().int().min(1, "Wisdom must be at least 1").max(30, "Wisdom cannot exceed 30").optional(),

  charisma: z.number().int().min(1, "Charisma must be at least 1").max(30, "Charisma cannot exceed 30").optional(),

  actions: z.array(PlayerCharacterActionSchema).max(20, "Maximum 20 actions allowed").optional(),
});

export type UpdatePlayerCharacterCommand = z.infer<typeof UpdatePlayerCharacterCommandSchema>;
