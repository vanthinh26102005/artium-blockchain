import type {
  CreateInvoicePaymentIntentRequest,
  CreateInvoicePaymentIntentResponse,
  CreateInvoiceRequest,
  CreateInvoiceResponse,
  InvoiceResponse,
  SendInvoiceRequest,
  UpdateInvoiceRequest,
} from './invoiceApis'

const generateMockInvoiceCode = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `INV-${timestamp}-${random}`
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockCreateQuickSellInvoice = async (
  payload: CreateInvoiceRequest,
): Promise<CreateInvoiceResponse> => {
  await delay(800)

  const artworkTotal = payload.artworks.reduce((sum, item) => {
    const qty = item.quantity || 1
    const lineTotal = item.price * qty
    const discounted = lineTotal * (1 - item.discountPercent / 100)
    return sum + discounted
  }, 0)

  const customTotal = payload.customItems.reduce((sum, item) => {
    const qty = item.quantity || 1
    const lineTotal = item.price * qty
    const discounted = lineTotal * (1 - item.discountPercent / 100)
    return sum + discounted
  }, 0)

  const subtotal = artworkTotal + customTotal
  const tax = payload.isApplySalesTax ? subtotal * ((payload.taxPercent || 0) / 100) : 0
  const totalAmount = Math.round((subtotal + tax) * 100) / 100

  const response: CreateInvoiceResponse = {
    id: `mock-invoice-${Date.now()}`,
    invoiceCode: generateMockInvoiceCode(),
    totalAmount,
    invoiceItems: [
      ...payload.artworks.map((item, i) => ({
        id: `item-artwork-${i}`,
        type: 'Artium-artwork' as const,
        salePrice: item.price,
        quantity: item.quantity || 1,
        discountPercentage: item.discountPercent,
        artworkId: item.id,
        artworkName: item.artworkName,
        artworkImageUrl: item.artworkImageUrl,
      })),
      ...payload.customItems.map((item, i) => ({
        id: `item-custom-${i}`,
        type: 'custom-item' as const,
        salePrice: item.price,
        quantity: item.quantity || 1,
        discountPercentage: item.discountPercent,
        artworkName: item.title,
      })),
    ],
  }

  return response
}

export const mockGetInvoiceByCode = async (invoiceCode: string): Promise<InvoiceResponse> => {
  await delay(500)

  return {
    id: 'mock-invoice-id',
    invoiceCode,
    status: 'sent',
    subtotal: 1500,
    discountAmount: 0,
    taxAmount: 0,
    taxPercent: 0,
    totalAmount: 1500,
    currency: 'USD',
    collector: {
      name: 'Mock Buyer',
      email: 'buyer@example.com',
    },
    items: [
      {
        id: 'mock-item-1',
        type: 'Artium-artwork',
        salePrice: 1500,
        quantity: 1,
        discountPercentage: 0,
        artworkName: 'Mock Artwork',
      },
    ],
    createdAt: new Date().toISOString(),
  }
}

export const mockDeleteInvoice = async (id: string): Promise<{ success: boolean }> => {
  await delay(500)
  void id
  return { success: true }
}

export const mockUpdateInvoice = async (
  id: string,
  payload: UpdateInvoiceRequest,
): Promise<InvoiceResponse> => {
  await delay(500)
  void payload
  return mockGetInvoiceByCode(id)
}

export const mockSendQuickSellInvoice = async (
  invoiceCode: string,
  payload: SendInvoiceRequest,
): Promise<{ success: boolean }> => {
  await delay(500)
  void invoiceCode
  void payload
  return { success: true }
}

export const mockCreateQuickSellPaymentIntent = async (
  invoiceCode: string,
  payload: CreateInvoicePaymentIntentRequest,
): Promise<CreateInvoicePaymentIntentResponse> => {
  await delay(500)
  void invoiceCode
  void payload
  const mockId = `pi_mock_${Date.now()}`
  return {
    transactionId: `txn_${Date.now()}`,
    paymentIntentId: mockId,
    clientSecret: `${mockId}_secret_mock`,
    amount: 0,
    currency: 'usd',
  }
}
