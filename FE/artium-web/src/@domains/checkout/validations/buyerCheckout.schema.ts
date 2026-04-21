import { z } from 'zod'

export const PHONE_REGEX = /^[\d\s\-()]+$/
export const CARD_EXPIRY_REGEX = /^(0[1-9]|1[0-2])\s?\/\s?\d{2}$/

export const buyerContactSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'Max 50 characters'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Max 50 characters'),
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

export const buyerCheckoutPaymentSchema = z.object({
  paymentMethod: z.enum(['card', 'google_pay', 'klarna']),
  cardNumber: z
    .string()
    .trim()
    .min(1, 'Card number is required')
    .refine((value) => value.replace(/\s/g, '').length >= 13, 'Card number is incomplete'),
  expiryDate: z
    .string()
    .trim()
    .min(1, 'Expiry date is required')
    .regex(CARD_EXPIRY_REGEX, 'Use MM / YY format'),
  cvc: z
    .string()
    .trim()
    .min(1, 'Security code is required')
    .regex(/^\d{3,4}$/, 'Use a valid security code'),
  country: z.string().trim().min(1, 'Country is required'),
})

export type BuyerCheckoutContactStepValues = z.infer<typeof buyerCheckoutContactStepSchema>
export type BuyerCheckoutPaymentValues = z.infer<typeof buyerCheckoutPaymentSchema>
