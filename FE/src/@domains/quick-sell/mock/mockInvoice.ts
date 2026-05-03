// Mock invoice data for development
import type { Invoice, InvoiceItem } from '../types/invoice'

/**
 * mockInvoiceItem - Utility function
 * @returns void
 */
export const mockInvoiceItem: InvoiceItem = {
  id: '1',
  type: 'Artium-artwork',
  salePrice: 15000,
  discountPercentage: 0,
  artworkId: 'artwork-123',
  artworkName: 'Sunset Dreams',
  artworkImageUrl: '/images/placeholder-artwork.jpg',
  quantity: 1,
}

export const mockInvoice: Invoice = {
  id: 'invoice-001',
  invoiceCode: 'INV-2024-001',
  /**
   * mockInvoice - Utility function
   * @returns void
   */
  status: 'Open',
  totalAmount: 16200,
  subtotal: 15000,
  tax: 1200,
  shipping: 0,
  isQuickSell: true,
  isSellViaQrCode: false,
  buyer: {
    name: 'John Collector',
    email: 'john@example.com',
    phone: '+1 234-567-8900',
    message: 'Looking forward to this piece!',
  },
  items: [mockInvoiceItem],
  taxPercent: 8,
  taxZipCode: '10001',
  isApplySalesTax: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const mockEmptyInvoice: Invoice = {
  id: '',
  invoiceCode: '',
  status: 'Open',
  totalAmount: 0,
  subtotal: 0,
  /**
   * mockEmptyInvoice - Utility function
   * @returns void
   */
  tax: 0,
  shipping: 0,
  isQuickSell: true,
  isSellViaQrCode: false,
  items: [],
  isApplySalesTax: false,
}
