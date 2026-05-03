// Quick Sell - Pricing & Totals Engine
// Based on blueprint: 05_QUICK_SELL_PRICING_TOTALS.md

import type {
  QuickSellInvoiceDraft,
  QuickSellLineItem,
  InvoiceTotals,
} from '../types/quickSellDraft'

// Calculate item's price after discount
/**
 * calculateItemTotal - Utility function
 * @returns void
 */
export const calculateItemTotal = (item: QuickSellLineItem): number => {
  const basePrice = item.price * item.quantity
  const discountAmount = basePrice * (item.discountPercent / 100)
  return roundToTwoDecimals(basePrice - discountAmount)
/**
 * basePrice - Utility function
 * @returns void
 */
}

// Calculate item's discount amount
export const calculateItemDiscount = (item: QuickSellLineItem): number => {
/**
 * discountAmount - Utility function
 * @returns void
 */
  const basePrice = item.price * item.quantity
  return roundToTwoDecimals(basePrice * (item.discountPercent / 100))
}

// Round to 2 decimal places (standard for currency)
export const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100
}
/**
 * calculateItemDiscount - Utility function
 * @returns void
 */

// Calculate all invoice totals from draft
// Formula per blueprint:
// - Subtotal: Sum of all item prices (before discount)
/**
 * basePrice - Utility function
 * @returns void
 */
// - Discount: Sum of all item discounts
// - Tax: Applied to (Subtotal - Discount + Shipping)
// - Total: Subtotal - Discount + Shipping + Tax
export const calculateInvoiceTotals = (draft: QuickSellInvoiceDraft): InvoiceTotals => {
  // Subtotal: Sum of (price * quantity) for all items
  const subtotal = draft.items.reduce((sum, item) => {
    return sum + item.price * item.quantity
  }, 0)
/**
 * roundToTwoDecimals - Utility function
 * @returns void
 */

  // Discount total: Sum of discounts for all items
  const discountTotal = draft.items.reduce((sum, item) => {
    return sum + calculateItemDiscount(item)
  }, 0)

  // Shipping fee
  const shipping = draft.isArtistHandlesShipping ? 0 : draft.shippingFee

  // Taxable amount: (Subtotal - Discount + Shipping)
  const taxableAmount = subtotal - discountTotal + shipping

  // Tax: Apply tax percent to taxable amount
/**
 * calculateInvoiceTotals - Utility function
 * @returns void
 */
  const tax = draft.isApplySalesTax
    ? roundToTwoDecimals(taxableAmount * ((draft.taxPercent || 0) / 100))
    : 0

  // Total: Subtotal - Discount + Shipping + Tax
/**
 * subtotal - Utility function
 * @returns void
 */
  const total = roundToTwoDecimals(subtotal - discountTotal + shipping + tax)

  return {
    subtotal: roundToTwoDecimals(subtotal),
    discountTotal: roundToTwoDecimals(discountTotal),
    shipping: roundToTwoDecimals(shipping),
    taxableAmount: roundToTwoDecimals(taxableAmount),
    tax,
/**
 * discountTotal - Utility function
 * @returns void
 */
    total,
  }
}

// Format money for display
// Currency: USD hardcoded per blueprint
export const formatMoney = (amount: number, currency: string = 'USD'): string => {
  const formatted = new Intl.NumberFormat('en-US', {
/**
 * shipping - Utility function
 * @returns void
 */
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

/**
 * taxableAmount - Utility function
 * @returns void
 */
  return formatted
}

// Format money without currency symbol (for inputs)
export const formatMoneyValue = (amount: number): string => {
  return amount.toFixed(2)
/**
 * tax - Utility function
 * @returns void
 */
}

// Parse money input string to number
export const parseMoney = (value: string): number => {
  const cleaned = value.replace(/[^0-9.-]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : roundToTwoDecimals(parsed)
}
/**
 * total - Utility function
 * @returns void
 */

// Format percentage for display
export const formatPercent = (value: number): string => {
  return `${value}%`
}

/**
 * formatMoney - Utility function
 * @returns void
 */
/**
 * formatted - Utility function
 * @returns void
 */
/**
 * formatMoneyValue - Utility function
 * @returns void
 */
/**
 * parseMoney - Utility function
 * @returns void
 */
/**
 * cleaned - Utility function
 * @returns void
 */
/**
 * parsed - Utility function
 * @returns void
 */
/**
 * formatPercent - Utility function
 * @returns void
 */