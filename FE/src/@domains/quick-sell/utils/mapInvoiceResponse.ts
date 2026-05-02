import type { InvoiceResponse } from '@shared/apis/invoiceApis'
import type { CheckoutInvoice, InvoicePaymentStatus } from '../types/checkoutTypes'

const toNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0
  const num = Number(value)
  return Number.isNaN(num) ? 0 : num
}

const roundToTwo = (value: number): number => Math.round(value * 100) / 100

const mapStatus = (status?: InvoiceResponse['status']): InvoicePaymentStatus => {
  if (status === 'paid') return 'PAID'
  if (status === 'sent' || status === 'draft') return 'UNPAID'
  if (status === 'cancelled') return 'UNPAID'
  return 'UNPAID'
}

export const mapInvoiceResponseToCheckoutInvoice = (
  invoice: InvoiceResponse,
): CheckoutInvoice => {
  const items: CheckoutInvoice['items'] = (invoice.items || []).map((item, index) => {
    const isArtwork = item.type === 'Artium-artwork'
    const displayName = item.artworkName || item.description || `Item ${index + 1}`

    return {
      id: item.id,
      type: isArtwork ? 'artwork' : 'custom',
      name: displayName,
      title: isArtwork ? undefined : displayName,
      price: toNumber(item.salePrice),
      quantity: item.quantity || 1,
      discountPercent: item.discountPercentage || 0,
      imageUrl: item.artworkImageUrl,
      artworkId: item.artworkId,
      artworkName: item.artworkName,
      artworkImageUrl: item.artworkImageUrl,
    }
  })

  const subtotal = invoice.subtotal ?? items.reduce((sum, item) => {
    return sum + item.price * item.quantity
  }, 0)
  const discountTotal = invoice.discountAmount ?? items.reduce((sum, item) => {
    const lineTotal = item.price * item.quantity
    return sum + (lineTotal * item.discountPercent) / 100
  }, 0)
  const taxAmount = invoice.taxAmount ?? 0
  const taxableBase = subtotal - discountTotal
  const taxPercent =
    invoice.taxPercent ?? (taxableBase > 0 ? (taxAmount / taxableBase) * 100 : 0)

  return {
    id: invoice.id,
    invoiceCode: invoice.invoiceCode,
    status: mapStatus(invoice.status),
    items,
    buyer: invoice.collector?.email
      ? {
          name: invoice.collector?.name || '',
          email: invoice.collector?.email || '',
          message: invoice.collector?.message,
        }
      : undefined,
    subtotal: roundToTwo(toNumber(subtotal)),
    discountTotal: roundToTwo(toNumber(discountTotal)),
    shipping: 0,
    taxPercent: roundToTwo(toNumber(taxPercent)),
    tax: roundToTwo(toNumber(taxAmount)),
    total: roundToTwo(toNumber(invoice.totalAmount)),
    createdAt: invoice.createdAt || new Date().toISOString(),
  }
}
