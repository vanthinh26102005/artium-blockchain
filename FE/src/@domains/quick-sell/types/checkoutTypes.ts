// Quick Sell - Checkout Types
// For PR4 - Checkout page state management

export type InvoicePaymentStatus = 'UNPAID' | 'PENDING' | 'PAID'

export type CheckoutBuyerAddress = {
  firstName: string
  lastName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
}

export type CheckoutInvoice = {
  id: string
  invoiceCode: string
  status: InvoicePaymentStatus
  items: Array<{
    id: string
    type: 'artwork' | 'custom'
    name: string
    price: number
    quantity: number
    discountPercent: number
    imageUrl?: string
    artworkId?: string
    artworkName?: string
    artworkImageUrl?: string
    title?: string
    artistName?: string
    year?: string
    dimensions?: string
    materials?: string
  }>
  buyer?: {
    name: string
    email: string
    message?: string
  }
  seller?: {
    name?: string
    email?: string
  }
  subtotal: number
  discountTotal: number
  shipping: number
  taxPercent: number
  tax: number
  total: number
  createdAt: string
}

export type CheckoutDraft = {
  address: CheckoutBuyerAddress
  shippingFee: number
  taxPercent: number
  taxAmount: number
}

/**
 * defaultBuyerAddress - Utility function
 * @returns void
 */
export const defaultBuyerAddress: CheckoutBuyerAddress = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
}

export const defaultCheckoutDraft: CheckoutDraft = {
  address: defaultBuyerAddress,
  shippingFee: 0,
/**
 * defaultCheckoutDraft - Utility function
 * @returns void
 */
  taxPercent: 0,
  taxAmount: 0,
}
