import { z } from 'zod'

export const TITLE_LIMIT = 255
export const VENUE_LIMIT = 255
export const DESCRIPTION_LIMIT = 10000
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg'] as const

export type CreateEventFormValues = {
  title: string
  startDateTime: string
  endDateTime: string
  timeZone: string
  locationType: 'in-person' | 'online'
  types: string[]
  address: string
  venueDetails: string
  onlineUrl: string
  visibility: 'public' | 'private'
  description: string
  coverImage: File | null
}

const coverImageSchema = z.custom<File | null>(
  (value) =>
    value === null ||
    value === undefined ||
    (typeof File !== 'undefined' && value instanceof File),
  'Cover image is required',
)

export const createEventFormSchema = ({
  requireCoverImage,
}: {
  requireCoverImage: boolean
}) =>
  z
    .object({
      title: z
        .string()
        .trim()
        .min(1, 'Event title is required')
        .max(TITLE_LIMIT, `Max ${TITLE_LIMIT} characters`),
      startDateTime: z.string().min(1, 'Start date is required'),
      endDateTime: z.string().min(1, 'End date is required'),
      timeZone: z.string().min(1, 'Time zone is required'),
      locationType: z.enum(['in-person', 'online'], {
        message: 'Location is required',
      }),
      types: z.array(z.string()).min(1, 'Event type is required'),
      address: z.string(),
      venueDetails: z.string().max(VENUE_LIMIT, `Max ${VENUE_LIMIT} characters`),
      onlineUrl: z.string(),
      visibility: z.enum(['public', 'private'], {
        message: 'Visibility is required',
      }),
      description: z
        .string()
        .trim()
        .min(1, 'Description is required')
        .max(DESCRIPTION_LIMIT, `Max ${DESCRIPTION_LIMIT} characters`),
      coverImage: coverImageSchema.nullable(),
    })
    .superRefine((values, context) => {
      if (new Date(values.endDateTime) <= new Date(values.startDateTime)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endDateTime'],
          message: 'End date must be after start',
        })
      }

      if (values.locationType === 'online' && !values.onlineUrl.trim()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['onlineUrl'],
          message: 'Event URL is required',
        })
      }

      if (values.locationType === 'in-person' && !values.address.trim()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['address'],
          message: 'Address is required',
        })
      }

      if (!values.coverImage && requireCoverImage) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['coverImage'],
          message: 'Cover image is required',
        })
        return
      }

      if (!values.coverImage) {
        return
      }

      if (!ALLOWED_IMAGE_TYPES.includes(values.coverImage.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['coverImage'],
          message: 'Only PNG or JPG files are allowed',
        })
      }

      if (values.coverImage.size > MAX_IMAGE_SIZE) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['coverImage'],
          message: 'Max file size is 2MB',
        })
      }
    })

export type InviteEventFormValues = {
  recipientEmails: string[]
  personalMessage?: string
}

const eventEmailSchema = z.string().trim().email('Please enter valid email addresses')

export const inviteEventFormSchema = z.object({
  recipientEmails: z
    .array(eventEmailSchema)
    .min(1, 'At least one email is required'),
  personalMessage: z.string().max(2000, 'Message must be 2000 characters or less').optional(),
})
