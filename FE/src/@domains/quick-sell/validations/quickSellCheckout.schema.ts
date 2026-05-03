import { z } from 'zod'

/**
 * quickSellCheckoutAddressSchema - Utility function
 * @returns void
 */
export const quickSellCheckoutAddressSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().min(1, 'Email is required').email('Please enter a valid email'),
  phone: z.string().trim().optional(),
  addressLine1: z.string().trim().min(1, 'Address is required'),
  addressLine2: z.string(),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  postalCode: z.string().trim().min(1, 'ZIP code is required'),
  country: z.string().trim().min(1, 'Country is required'),
})

export const quickSellCheckoutFormSchema = z.object({
  address: quickSellCheckoutAddressSchema,
  deliveryMethod: z.enum(['pickup', 'Artium', 'invoice_only']),
/**
 * quickSellCheckoutFormSchema - Utility function
 * @returns void
 */
  paymentCountry: z.string().trim().min(1, 'Country is required'),
})

export type QuickSellCheckoutFormValues = z.infer<typeof quickSellCheckoutFormSchema>
