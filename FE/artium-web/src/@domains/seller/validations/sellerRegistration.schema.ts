import { z } from 'zod'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const isOptionalUrl = (value?: string) => {
  const trimmed = value?.trim()
  if (!trimmed) return true

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    const parsed = new URL(withProtocol)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export const normalizeSellerSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 75)

export const normalizeOptionalUrl = (value?: string | null) => {
  const trimmed = value?.trim()
  if (!trimmed) return null
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export const sellerRegistrationSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Seller display name must be at least 2 characters.')
    .max(80, 'Seller display name must be 80 characters or less.'),
  slug: z
    .string()
    .trim()
    .min(3, 'Profile URL must be at least 3 characters.')
    .max(75, 'Profile URL must be 75 characters or less.')
    .regex(slugPattern, 'Use lowercase letters, numbers, and single hyphens only.'),
  profileType: z.enum(['individual', 'gallery', 'institution']),
  bio: z
    .string()
    .trim()
    .max(600, 'Seller bio must be 600 characters or less.')
    .optional()
    .or(z.literal('')),
  location: z
    .string()
    .trim()
    .max(120, 'Location must be 120 characters or less.')
    .optional()
    .or(z.literal('')),
  websiteUrl: z
    .string()
    .trim()
    .max(1024, 'Website URL is too long.')
    .optional()
    .or(z.literal(''))
    .refine((value) => isOptionalUrl(value), 'Enter a valid website URL.'),
})

export type SellerRegistrationFormValues = z.infer<typeof sellerRegistrationSchema>
