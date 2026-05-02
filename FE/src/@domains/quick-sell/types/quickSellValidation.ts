import type { QuickSellInvoiceDraft, QuickSellLineItem } from './quickSellDraft'
import {
  quickSellBuyerInfoSchema,
  quickSellInvoiceFormSchema,
  quickSellLineItemSchema,
} from '../validations/quickSellInvoice.schema'

export type ValidationError = {
  field: string
  message: string
}

export type ValidationResult = {
  isValid: boolean
  errors: ValidationError[]
}

export const validateLineItem = (item: QuickSellLineItem, index: number): ValidationError[] => {
  const result = quickSellLineItemSchema.safeParse(item)

  if (result.success) {
    return []
  }

  const prefix = `items.${index}`
  return result.error.issues.map((issue) => ({
    field: issue.path.length > 0 ? `${prefix}.${issue.path.join('.')}` : prefix,
    message: issue.message,
  }))
}

export const validateBuyerInfo = (buyer: QuickSellInvoiceDraft['buyer']): ValidationError[] => {
  const result = quickSellBuyerInfoSchema.safeParse(buyer)
  if (result.success) {
    return []
  }

  return result.error.issues.map((issue) => ({
    field: issue.path.length > 0 ? `buyer.${issue.path.join('.')}` : 'buyer',
    message: issue.message,
  }))
}

export const validateTaxSettings = (draft: QuickSellInvoiceDraft): ValidationError[] => {
  const result = quickSellInvoiceFormSchema.pick({
    isApplySalesTax: true,
    taxPercent: true,
    taxZipCode: true,
    shippingFee: true,
    buyer: true,
    items: true,
    isArtistHandlesShipping: true,
  }).safeParse(draft)

  if (result.success) {
    return []
  }

  return result.error.issues
    .filter((issue) => issue.path[0] === 'taxPercent' || issue.path[0] === 'shippingFee')
    .map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }))
}

export const validateInvoiceDraft = (draft: QuickSellInvoiceDraft): ValidationResult => {
  const result = quickSellInvoiceFormSchema.safeParse(draft)
  const errors = result.success
    ? []
    : result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }))

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const canSubmitDraft = (draft: QuickSellInvoiceDraft): boolean => {
  return quickSellInvoiceFormSchema.safeParse(draft).success
}
