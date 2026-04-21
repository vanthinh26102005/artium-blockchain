// Quick Sell - Form Validation Schema
// Uses native validation (no zod/yup in repo) - manual validation

import type { QuickSellInvoiceDraft, QuickSellLineItem } from './quickSellDraft'

export type ValidationError = {
  field: string
  message: string
}

export type ValidationResult = {
  isValid: boolean
  errors: ValidationError[]
}

// Validate a single line item
export const validateLineItem = (item: QuickSellLineItem, index: number): ValidationError[] => {
  const errors: ValidationError[] = []
  const prefix = `items.${index}`

  // Price validation
  if (item.price < 0) {
    errors.push({
      field: `${prefix}.price`,
      message: 'Price must be 0 or greater',
    })
  }

  // Quantity validation
  if (item.quantity < 1) {
    errors.push({
      field: `${prefix}.quantity`,
      message: 'Quantity must be at least 1',
    })
  }

  // Discount validation
  if (item.discountPercent < 0 || item.discountPercent > 100) {
    errors.push({
      field: `${prefix}.discountPercent`,
      message: 'Discount must be between 0 and 100',
    })
  }

  // Custom item title validation
  if (item.type === 'custom' && !item.title.trim()) {
    errors.push({
      field: `${prefix}.title`,
      message: 'Title is required for custom items',
    })
  }

  return errors
}

// Validate buyer info
export const validateBuyerInfo = (buyer: QuickSellInvoiceDraft['buyer']): ValidationError[] => {
  const errors: ValidationError[] = []

  if (!buyer.email.trim()) {
    errors.push({
      field: 'buyer.email',
      message: 'Email is required',
    })
    return errors
  }

  // Email format validation (optional but if provided must be valid)
  if (buyer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email)) {
    errors.push({
      field: 'buyer.email',
      message: 'Please enter a valid email address',
    })
  }

  return errors
}

// Validate tax settings
export const validateTaxSettings = (draft: QuickSellInvoiceDraft): ValidationError[] => {
  const errors: ValidationError[] = []

  if (draft.isApplySalesTax) {
    if (draft.taxPercent == null) {
      errors.push({
        field: 'taxPercent',
        message: 'Tax percent is required',
      })
    } else if (draft.taxPercent < 0 || draft.taxPercent > 100) {
      errors.push({
        field: 'taxPercent',
        message: 'Tax percent must be between 0 and 100',
      })
    }
  }

  if (draft.shippingFee < 0) {
    errors.push({
      field: 'shippingFee',
      message: 'Shipping fee must be 0 or greater',
    })
  }

  return errors
}

// Full validation of invoice draft
export const validateInvoiceDraft = (draft: QuickSellInvoiceDraft): ValidationResult => {
  const errors: ValidationError[] = []

  // Must have at least 1 item
  if (draft.items.length === 0) {
    errors.push({
      field: 'items',
      message: 'At least one item is required',
    })
  }

  // Validate each item
  draft.items.forEach((item, index) => {
    errors.push(...validateLineItem(item, index))
  })

  // Validate buyer info
  errors.push(...validateBuyerInfo(draft.buyer))

  // Validate tax settings
  errors.push(...validateTaxSettings(draft))

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Check if draft can be submitted (minimum requirements)
export const canSubmitDraft = (draft: QuickSellInvoiceDraft): boolean => {
  // Must have at least 1 item
  if (draft.items.length === 0) return false

  if (!draft.buyer.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.buyer.email)) {
    return false
  }

  // All items must have valid prices
  for (const item of draft.items) {
    if (item.price < 0 || item.quantity < 1) return false
    if (item.discountPercent < 0 || item.discountPercent > 100) return false
    if (item.type === 'custom' && !item.title.trim()) return false
  }

  return true
}
