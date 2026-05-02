// Quick Sell - Invoice Types
// Based on blueprint: 08_QUICK_SELL_TYPES_AND_MODELS.md

export type InvoiceStatus = 'Open' | 'Paid' | 'In Transit' | 'Delivered'

export type InvoiceItemType = 'Artium-artwork' | 'custom-item'

export type Money = {
  amount: number
  currency: string
}

export type Buyer = {
  name: string
  email: string
  phone?: string
  message?: string
}

export type InvoiceItem = {
  id: string
  type: InvoiceItemType
  salePrice: number
  discountPercentage: number
  artworkId?: string
  artworkName?: string
  artworkImageUrl?: string
  quantity?: number
}

export type Invoice = {
  id: string
  invoiceCode: string
  status: InvoiceStatus
  totalAmount: number
  subtotal: number
  tax: number
  shipping: number
  isQuickSell: boolean
  isSellViaQrCode: boolean
  buyer?: Buyer
  items: InvoiceItem[]
  taxPercent?: number
  taxZipCode?: string
  isApplySalesTax?: boolean
  createdAt?: string
  updatedAt?: string
}

export type CreateInvoiceFormData = {
  invoiceCode?: string
  items: InvoiceItem[]
  buyer?: Buyer
  isQuickSell?: boolean
  isApplySalesTax?: boolean
  taxPercent?: number
  taxZipCode?: string
}
