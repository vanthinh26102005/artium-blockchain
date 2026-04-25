import { z } from 'zod'

export const normalizeProfileSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 75)

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const editProfileSchema = z.object({
  avatarUrl: z.string().trim(),
  username: z
    .string()
    .trim()
    .min(1, 'Username is required.')
    .max(75, 'Username must be 75 characters or less.')
    .regex(slugPattern, 'Use lowercase letters, numbers, and single hyphens only.'),
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required.')
    .max(30, 'First name must be 30 characters or less.'),
  lastName: z.string().max(30, 'Last name must be 30 characters or less.'),
  phoneNumber: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string(),
  district: z.string(),
  province: z.string(),
  country: z.string(),
  postalCode: z.string(),
  headline: z.string().max(100, 'Headline must be 100 characters or less.'),
  biography: z.string().max(1000, 'Biography must be 1000 characters or less.'),
  websiteUrl: z.string(),
  instagram: z.string(),
  twitter: z.string(),
  profileCategories: z.array(z.string()),
  roles: z.array(z.string()),
  artisticVibes: z.array(z.string()),
  artisticValues: z.array(z.string()),
  artisticMediums: z.array(z.string()),
  connectionAffiliations: z.string().max(50, 'Affiliations must be 50 characters or less.'),
  connectionSeenAt: z.string().max(50, 'This field must be 50 characters or less.'),
  connectionCurrently: z.string().max(100, 'This field must be 100 characters or less.'),
  inspireVibes: z.array(z.string()),
  inspireValues: z.array(z.string()),
  inspireMediums: z.array(z.string()),
  bankName: z.string(),
  bankAccountHolder: z.string(),
  bankAccountNumber: z.string(),
  bankBranch: z.string(),
  bankSwiftCode: z.string(),
  bankAddress: z.string(),
})
