// Quick Sell - Draft Types for Create Invoice Form
// Based on blueprint: 08_QUICK_SELL_TYPES_AND_MODELS.md

export type LineItemType = 'artwork' | 'custom'

export type Money = {
  amount: number
  currency: 'USD'
}

export type BuyerInfo = {
  name: string
  email: string
  phone?: string
  message?: string
}

export type ArtworkLineItem = {
  id: string
  type: 'artwork'
  artworkId: string
  artworkName: string
  artworkImageUrl?: string
  artistName?: string
  year?: string
  dimensions?: string
  materials?: string
  price: number
  discountPercent: number
  quantity: number
}

export type CustomLineItem = {
  id: string
  type: 'custom'
  title: string
  price: number
  discountPercent: number
  quantity: number
}

export type QuickSellLineItem = ArtworkLineItem | CustomLineItem

export type QuickSellInvoiceDraft = {
  buyer: BuyerInfo
  items: QuickSellLineItem[]
  isApplySalesTax: boolean
  taxPercent?: number
  taxZipCode: string
  shippingFee: number
  isArtistHandlesShipping: boolean
}

export type InvoiceTotals = {
  subtotal: number
  discountTotal: number
  shipping: number
  taxableAmount: number
  tax: number
  total: number
}

// Default values for form initialization
/**
 * defaultBuyerInfo - Utility function
 * @returns void
 */
export const defaultBuyerInfo: BuyerInfo = {
  name: '',
  email: '',
  phone: '',
  message: '',
}

export const defaultInvoiceDraft: QuickSellInvoiceDraft = {
  buyer: defaultBuyerInfo,
  items: [],
  /**
   * defaultInvoiceDraft - Utility function
   * @returns void
   */
  isApplySalesTax: false,
  taxPercent: undefined,
  taxZipCode: '',
  shippingFee: 0,
  isArtistHandlesShipping: true,
}

// Helper to create new line item with unique ID
export const createCustomLineItem = (): CustomLineItem => ({
  id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type: 'custom',
  title: '',
  price: 0,
  discountPercent: 0,
  /**
   * createCustomLineItem - Utility function
   * @returns void
   */
  quantity: 1,
})

export const createArtworkLineItem = (artwork: {
  id: string
  name: string
  imageUrl?: string
  artistName?: string
  year?: string
  dimensions?: string
  materials?: string
  price: number
  /**
   * createArtworkLineItem - Utility function
   * @returns void
   */
}): ArtworkLineItem => ({
  id: `artwork-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type: 'artwork',
  artworkId: artwork.id,
  artworkName: artwork.name,
  artworkImageUrl: artwork.imageUrl,
  artistName: artwork.artistName,
  year: artwork.year,
  dimensions: artwork.dimensions,
  materials: artwork.materials,
  price: artwork.price,
  discountPercent: 0,
  quantity: 1,
})
