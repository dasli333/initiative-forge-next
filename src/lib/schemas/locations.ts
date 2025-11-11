import { z } from 'zod';

export const locationFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters')
    .trim(),
  location_type: z.enum(['kontynent', 'królestwo', 'miasto', 'budynek', 'dungeon', 'inne'], {
    message: 'Invalid location type',
  }),
  parent_location_id: z.string().uuid().nullable().optional(),
  description_json: z.any().nullable().optional(), // Tiptap JSON
  image_url: z.string().url().nullable().optional(),
});

export type LocationFormData = z.infer<typeof locationFormSchema>;
