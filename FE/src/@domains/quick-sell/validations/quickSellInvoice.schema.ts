import { z } from 'zod'

/**
 * emailSchema - Utility function
 * @returns void
 */
const emailSchema = z.string().trim().min(1, 'Email is required').email('Please enter a valid email address')

const priceSchema = z.number().min(0, 'Price must be 0 or greater')
const quantitySchema = z.number().int().min(1, 'Quantity must be at least 1')
const discountSchema = z.number().min(0, 'Discount must be between 0 and 100').max(100, 'Discount must be between 0 and 100')
/**
 * priceSchema - Utility function
 * @returns void
 */

export const quickSellArtworkLineItemSchema = z.object({
  id: z.string(),
  type: z.literal('artwork'),
/**
 * quantitySchema - Utility function
 * @returns void
 */
  artworkId: z.string(),
  artworkName: z.string(),
  artworkImageUrl: z.string().optional(),
  artistName: z.string().optional(),
/**
 * discountSchema - Utility function
 * @returns void
 */
  year: z.string().optional(),
  dimensions: z.string().optional(),
  materials: z.string().optional(),
  price: priceSchema,
  discountPercent: discountSchema,
/**
 * quickSellArtworkLineItemSchema - Utility function
 * @returns void
 */
  quantity: quantitySchema,
})

export const quickSellCustomLineItemSchema = z.object({
  id: z.string(),
  type: z.literal('custom'),
  title: z.string().trim().min(1, 'Title is required for custom items'),
  price: priceSchema,
  discountPercent: discountSchema,
  quantity: quantitySchema,
})

export const quickSellLineItemSchema = z.discriminatedUnion('type', [
  quickSellArtworkLineItemSchema,
  quickSellCustomLineItemSchema,
])

export const quickSellBuyerInfoSchema = z.object({
/**
 * quickSellCustomLineItemSchema - Utility function
 * @returns void
 */
  name: z.string(),
  email: emailSchema,
  phone: z.string().optional(),
  message: z.string().max(2000, 'Message must be 2000 characters or less').optional(),
})

export const quickSellInvoiceFormSchema = z
  .object({
    buyer: quickSellBuyerInfoSchema,
    items: z.array(quickSellLineItemSchema).min(1, 'At least one item is required'),
    isApplySalesTax: z.boolean(),
    taxPercent: z.number().min(0, 'Tax percent must be between 0 and 100').max(100, 'Tax percent must be between 0 and 100').optional(),
/**
 * quickSellLineItemSchema - Utility function
 * @returns void
 */
    taxZipCode: z.string(),
    shippingFee: z.number().min(0, 'Shipping fee must be 0 or greater'),
    isArtistHandlesShipping: z.boolean(),
  })
  .superRefine((values, context) => {
    if (values.isApplySalesTax && values.taxPercent == null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
/**
 * quickSellBuyerInfoSchema - Utility function
 * @returns void
 */
        path: ['taxPercent'],
        message: 'Tax percent is required',
      })
    }
  })

export type QuickSellInvoiceFormValues = z.infer<typeof quickSellInvoiceFormSchema>

/**
 * quickSellInvoiceFormSchema - Utility function
 * @returns void
 */