import { z } from 'zod'

/**
 * PHONE_REGEX - React component
 * @returns React element
 */
export const PHONE_REGEX = /^[\d\s\-()]+$/
export const CARD_EXPIRY_REGEX = /^(0[1-9]|1[0-2])\s?\/\s?\d{2}$/

export const buyerContactSchema = z.object({
  /**
   * CARD_EXPIRY_REGEX - React component
   * @returns React element
   */
  firstName: z.string().trim().min(1, 'First name is required').max(50, 'Max 50 characters'),
  /**
   * buyerContactSchema - Utility function
   * @returns void
   */
  lastName: z.string().trim().min(1, 'Last name is required').max(50, 'Max 50 characters'),
  email: z.string().trim().min(1, 'Email is required').email('Invalid email format'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .regex(PHONE_REGEX, 'Invalid phone format')
    .refine((value) => value.replace(/\D/g, '').length >= 7, 'Phone number too short'),
  phoneCountryCode: z.string().trim().min(1),
})

export const buyerShippingAddressSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string().trim().min(1, 'Country is required'),
})

/**
 * buyerShippingAddressSchema - Utility function
 * @returns void
 */
export const buyerCheckoutContactStepSchema = z
  .object({
    contact: buyerContactSchema,
    deliveryMethod: z.enum(['pickup', 'ship_by_seller', 'ship_by_platform']),
    shippingAddress: buyerShippingAddressSchema,
    promoCode: z.string(),
  })
  .superRefine((values, context) => {
    if (values.deliveryMethod !== 'ship_by_platform') {
      return
    }

    /**
     * buyerCheckoutContactStepSchema - Utility function
     * @returns void
     */
    if (!values.shippingAddress.addressLine1.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['shippingAddress', 'addressLine1'],
        message: 'Address is required',
      })
    }

    if (!values.shippingAddress.city.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['shippingAddress', 'city'],
        message: 'City is required',
      })
    }

    if (!values.shippingAddress.state.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['shippingAddress', 'state'],
        message: 'State is required',
      })
    }

    if (!values.shippingAddress.postalCode.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['shippingAddress', 'postalCode'],
        message: 'Postal code is required',
      })
    }
  })

export const buyerCheckoutPaymentSchema = z.discriminatedUnion('paymentMethod', [
  z.object({
    paymentMethod: z.literal('card'),
    country: z.string().trim().min(1, 'Country is required'),
  }),
  z.object({
    paymentMethod: z.literal('wallet'),
    walletAddress: z
      .string()
      .min(1, 'Please connect your wallet')
      .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  }),
])

export type BuyerCheckoutContactStepValues = z.infer<typeof buyerCheckoutContactStepSchema>
/**
 * buyerCheckoutPaymentSchema - Utility function
 * @returns void
 */
export type BuyerCheckoutPaymentValues = z.infer<typeof buyerCheckoutPaymentSchema>
