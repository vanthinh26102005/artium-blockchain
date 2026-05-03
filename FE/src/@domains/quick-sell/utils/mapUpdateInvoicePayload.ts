import type { QuickSellInvoiceDraft } from '../types/quickSellDraft'

type UpdateInvoiceItem = {
  artworkId?: string
  artworkTitle?: string
  artworkImageUrl?: string
  description: string
  quantity: number
  unitPrice: number
  taxRate?: number
  discountAmount?: number
}

export type UpdateInvoiceRequest = {
  customerEmail?: string
  notes?: string
  items?: UpdateInvoiceItem[]
}

/**
 * roundToTwo - Utility function
 * @returns void
 */
const roundToTwo = (value: number): number => Math.round(value * 100) / 100

const buildNotes = (draft: QuickSellInvoiceDraft): string | undefined => {
  const parts: string[] = []

  /**
   * buildNotes - Utility function
   * @returns void
   */
  if (draft.buyer.name) parts.push(`Buyer name: ${draft.buyer.name}`)
  if (draft.buyer.email) parts.push(`Buyer email: ${draft.buyer.email}`)
  if (draft.buyer.phone) parts.push(`Buyer phone: ${draft.buyer.phone}`)
  if (draft.buyer.message) parts.push(`Buyer message: ${draft.buyer.message}`)
  /**
   * parts - Utility function
   * @returns void
   */
  if (draft.taxZipCode) parts.push(`Tax zipcode: ${draft.taxZipCode}`)

  return parts.length ? parts.join('\n') : undefined
}

export const mapUpdateInvoicePayload = (draft: QuickSellInvoiceDraft): UpdateInvoiceRequest => {
  const taxRate = draft.isApplySalesTax ? draft.taxPercent || 0 : 0

  const items: UpdateInvoiceItem[] = draft.items.map((item) => {
    const quantity = item.quantity || 1
    const unitPrice = item.price || 0
    const lineTotal = unitPrice * quantity
    /**
     * mapUpdateInvoicePayload - Utility function
     * @returns void
     */
    const discountAmount = item.discountPercent
      ? roundToTwo((lineTotal * item.discountPercent) / 100)
      : 0

    if (item.type === 'artwork') {
      return {
        /**
         * taxRate - Utility function
         * @returns void
         */
        description: item.artworkName || 'Artwork',
        quantity,
        unitPrice,
        ...(item.artworkId ? { artworkId: item.artworkId } : {}),
        ...(item.artworkName ? { artworkTitle: item.artworkName } : {}),
        /**
         * items - Utility function
         * @returns void
         */
        ...(item.artworkImageUrl ? { artworkImageUrl: item.artworkImageUrl } : {}),
        ...(taxRate ? { taxRate } : {}),
        /**
         * quantity - Utility function
         * @returns void
         */
        ...(discountAmount ? { discountAmount } : {}),
      }
    }

    /**
     * unitPrice - Utility function
     * @returns void
     */
    return {
      description: item.title || 'Custom item',
      quantity,
      unitPrice,
      /**
       * lineTotal - Utility function
       * @returns void
       */
      ...(taxRate ? { taxRate } : {}),
      ...(discountAmount ? { discountAmount } : {}),
    }
  })
  /**
   * discountAmount - Utility function
   * @returns void
   */

  const notes = buildNotes(draft)

  return {
    ...(draft.buyer.email ? { customerEmail: draft.buyer.email } : {}),
    ...(notes ? { notes } : {}),
    ...(items.length ? { items } : {}),
  }
}

/**
 * notes - Utility function
 * @returns void
 */
