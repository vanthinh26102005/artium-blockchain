// Quick Sell - Pricing & Totals Engine
// Based on blueprint: 05_QUICK_SELL_PRICING_TOTALS.md

import type {
  QuickSellInvoiceDraft,
  QuickSellLineItem,
  InvoiceTotals,
} from '../types/quickSellDraft'

// Calculate item's price after discount
export const calculateItemTotal = (item: QuickSellLineItem): number => {
  const basePrice = item.price * item.quantity
  const discountAmount = basePrice * (item.discountPercent / 100)
  return roundToTwoDecimals(basePrice - discountAmount)
}

// Calculate item's discount amount
export const calculateItemDiscount = (item: QuickSellLineItem): number => {
  const basePrice = item.price * item.quantity
  return roundToTwoDecimals(basePrice * (item.discountPercent / 100))
}

// Round to 2 decimal places (standard for currency)
export const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100
}

// Calculate all invoice totals from draft
// Formula per blueprint:
// - Subtotal: Sum of all item prices (before discount)
// - Discount: Sum of all item discounts
// - Tax: Applied to (Subtotal - Discount + Shipping)
// - Total: Subtotal - Discount + Shipping + Tax
export const calculateInvoiceTotals = (draft: QuickSellInvoiceDraft): InvoiceTotals => {
  // Subtotal: Sum of (price * quantity) for all items
  const subtotal = draft.items.reduce((sum, item) => {
    return sum + item.price * item.quantity
  }, 0)

  // Discount total: Sum of discounts for all items
  const discountTotal = draft.items.reduce((sum, item) => {
    return sum + calculateItemDiscount(item)
  }, 0)

  // Shipping fee
  const shipping = draft.isArtistHandlesShipping ? 0 : draft.shippingFee

  // Taxable amount: (Subtotal - Discount + Shipping)
  const taxableAmount = subtotal - discountTotal + shipping

  // Tax: Apply tax percent to taxable amount
  const tax = draft.isApplySalesTax
    ? roundToTwoDecimals(taxableAmount * ((draft.taxPercent || 0) / 100))
    : 0

  // Total: Subtotal - Discount + Shipping + Tax
  const total = roundToTwoDecimals(subtotal - discountTotal + shipping + tax)

  return {
    subtotal: roundToTwoDecimals(subtotal),
    discountTotal: roundToTwoDecimals(discountTotal),
    shipping: roundToTwoDecimals(shipping),
    taxableAmount: roundToTwoDecimals(taxableAmount),
    tax,
    total,
  }
}

// Format money for display
// Currency: USD hardcoded per blueprint
export const formatMoney = (amount: number, currency: string = 'USD'): string => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

  return formatted
}

// Format money without currency symbol (for inputs)
export const formatMoneyValue = (amount: number): string => {
  return amount.toFixed(2)
}

// Parse money input string to number
export const parseMoney = (value: string): number => {
  const cleaned = value.replace(/[^0-9.-]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : roundToTwoDecimals(parsed)
}

// Format percentage for display
export const formatPercent = (value: number): string => {
  return `${value}%`
}
