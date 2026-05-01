import { z } from 'zod'

export const MAX_MOODBOARD_NAME = 24

export const commentFormSchema = z.object({
  content: z.string().trim().min(1, 'Add a comment before posting.'),
})

export const createMoodboardNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Moodboard name is required.')
    .max(MAX_MOODBOARD_NAME, `Moodboard name must be ${MAX_MOODBOARD_NAME} characters or less.`),
})

export type CommentFormValues = z.infer<typeof commentFormSchema>
export type CreateMoodboardNameFormValues = z.infer<typeof createMoodboardNameSchema>
