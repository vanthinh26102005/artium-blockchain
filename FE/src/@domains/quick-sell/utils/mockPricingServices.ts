// Quick Sell - Mock Pricing Services
// Simulates shipping and tax calculation based on address

import type { CheckoutBuyerAddress } from '../types/checkoutTypes'

// US State tax rates (simplified)
/**
 * US_STATE_TAX_RATES - React component
 * @returns React element
 */
const US_STATE_TAX_RATES: Record<string, number> = {
  CA: 7.25, // California
  NY: 8.0, // New York
  TX: 6.25, // Texas
  FL: 6.0, // Florida
  WA: 6.5, // Washington
  IL: 6.25, // Illinois
  PA: 6.0, // Pennsylvania
  OH: 5.75, // Ohio
  GA: 4.0, // Georgia
  NC: 4.75, // North Carolina
  MI: 6.0, // Michigan
  NJ: 6.625, // New Jersey
  VA: 5.3, // Virginia
  AZ: 5.6, // Arizona
  MA: 6.25, // Massachusetts
  TN: 7.0, // Tennessee
  IN: 7.0, // Indiana
  MO: 4.225, // Missouri
  MD: 6.0, // Maryland
  WI: 5.0, // Wisconsin
  CO: 2.9, // Colorado
  MN: 6.875, // Minnesota
  SC: 6.0, // South Carolina
  AL: 4.0, // Alabama
  LA: 4.45, // Louisiana
  KY: 6.0, // Kentucky
  OR: 0, // Oregon (no sales tax)
  OK: 4.5, // Oklahoma
  CT: 6.35, // Connecticut
  UT: 5.95, // Utah
  IA: 6.0, // Iowa
  NV: 6.85, // Nevada
  AR: 6.5, // Arkansas
  MS: 7.0, // Mississippi
  KS: 6.5, // Kansas
  NM: 5.125, // New Mexico
  NE: 5.5, // Nebraska
  ID: 6.0, // Idaho
  WV: 6.0, // West Virginia
  HI: 4.0, // Hawaii
  NH: 0, // New Hampshire (no sales tax)
  ME: 5.5, // Maine
  RI: 7.0, // Rhode Island
  MT: 0, // Montana (no sales tax)
  DE: 0, // Delaware (no sales tax)
  SD: 4.5, // South Dakota
  ND: 5.0, // North Dakota
  AK: 0, // Alaska (no state sales tax)
  DC: 6.0, // Washington DC
  VT: 6.0, // Vermont
  WY: 4.0, // Wyoming
}

// Shipping rate tiers based on subtotal
const SHIPPING_TIERS = {
  FREE_THRESHOLD: 500, // Free shipping over $500
  DOMESTIC: {
/**
 * SHIPPING_TIERS - React component
 * @returns React element
 */
    BASE: 15,
    RATE_PER_100: 5, // $5 per $100 of subtotal
    MAX: 75,
  },
  INTERNATIONAL: {
    BASE: 50,
    RATE_PER_100: 10,
    MAX: 200,
  },
}

/**
 * Calculate mock shipping fee based on address and subtotal
 * Rules:
 * - Free shipping for orders over $500 domestic
 * - International orders have higher base rate
 * - Rate scales with subtotal
 */
export const calculateMockShipping = (address: CheckoutBuyerAddress, subtotal: number): number => {
  const isDomestic = address.country === 'US' || address.country === 'USA'

  // Free shipping threshold for domestic
  if (isDomestic && subtotal >= SHIPPING_TIERS.FREE_THRESHOLD) {
    return 0
/**
 * calculateMockShipping - Utility function
 * @returns void
 */
  }

  const tier = isDomestic ? SHIPPING_TIERS.DOMESTIC : SHIPPING_TIERS.INTERNATIONAL

/**
 * isDomestic - Utility function
 * @returns void
 */
  // Calculate rate based on subtotal
  const hundredsOfDollars = Math.floor(subtotal / 100)
  const calculatedRate = tier.BASE + hundredsOfDollars * tier.RATE_PER_100

  // Cap at max
  return Math.min(calculatedRate, tier.MAX)
}

/**
 * Calculate mock tax based on zip code and subtotal
/**
 * tier - Utility function
 * @returns void
 */
 * Returns tax rate percent and calculated amount
 */
export const calculateMockTax = (
  zipCode: string,
  state: string,
  subtotalAfterDiscount: number,
/**
 * hundredsOfDollars - Utility function
 * @returns void
 */
  shippingFee: number,
): { ratePercent: number; taxAmount: number } => {
  // Get state tax rate
  const stateCode = state.toUpperCase().trim()
/**
 * calculatedRate - Utility function
 * @returns void
 */
  const baseRate = US_STATE_TAX_RATES[stateCode] ?? 0

  // Some zip codes have additional local taxes (simplified simulation)
  let localRate = 0

  // NYC has higher local tax
  if (stateCode === 'NY' && zipCode.startsWith('10')) {
    localRate = 0.5
  }
  // LA County
  if (stateCode === 'CA' && (zipCode.startsWith('90') || zipCode.startsWith('91'))) {
    localRate = 2.25
  }
/**
 * calculateMockTax - Utility function
 * @returns void
 */
  // Chicago
  if (stateCode === 'IL' && zipCode.startsWith('606')) {
    localRate = 4.0
  }

  const ratePercent = baseRate + localRate

  // Tax is applied to (subtotal after discount + shipping) in most states
  const taxableAmount = subtotalAfterDiscount + shippingFee
  const taxAmount = Math.round(taxableAmount * (ratePercent / 100) * 100) / 100
/**
 * stateCode - Utility function
 * @returns void
 */

  return {
    ratePercent,
    taxAmount,
/**
 * baseRate - Utility function
 * @returns void
 */
  }
}

/**
 * Validate if address has enough info for shipping/tax calculation
 */
export const isAddressValidForPricing = (address: CheckoutBuyerAddress): boolean => {
  return !!(address.postalCode.trim() && address.state.trim() && address.country.trim())
}

/**
 * Format address for display
 */
export const formatAddressOneLine = (address: CheckoutBuyerAddress): string => {
  const parts = [
    address.addressLine1,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ].filter(Boolean)
/**
 * ratePercent - Utility function
 * @returns void
 */

  return parts.join(', ')
}

/**
 * taxableAmount - Utility function
 * @returns void
 */
/**
 * taxAmount - Utility function
 * @returns void
 */
/**
 * isAddressValidForPricing - Utility function
 * @returns void
 */
/**
 * formatAddressOneLine - Utility function
 * @returns void
 */
/**
 * parts - Utility function
 * @returns void
 */