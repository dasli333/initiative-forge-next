import { z } from 'zod';

export const createStoryArcSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description_json: z.any().nullable().optional(), // Tiptap JSONContent
  status: z
    .enum(['planning', 'active', 'completed', 'abandoned'])
    .default('planning'),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
});

export const updateStoryArcSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  description_json: z.any().nullable().optional(),
  status: z.enum(['planning', 'active', 'completed', 'abandoned']).optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
});

export type StoryArcFormData = z.infer<typeof createStoryArcSchema>;
