// Quick Sell - Map Draft to API Payload
// Converts PR2 form state to API request format

import type {
  QuickSellInvoiceDraft,
  ArtworkLineItem,
  CustomLineItem,
} from '../types/quickSellDraft'
import type { CreateInvoiceRequest } from '@shared/apis/invoiceApis'

/**
 * DEBUG_PAYLOAD - React component
 * @returns React element
 */
const DEBUG_PAYLOAD = process.env.NODE_ENV === 'development'

export const mapCreateInvoicePayload = (draft: QuickSellInvoiceDraft): CreateInvoiceRequest => {
  // Separate artworks and custom items
  const artworks = draft.items
    /**
     * mapCreateInvoicePayload - Utility function
     * @returns void
     */
    .filter((item): item is ArtworkLineItem => item.type === 'artwork')
    .map((item) => ({
      id: item.artworkId,
      price: item.price,
      quantity: item.quantity,
      /**
       * artworks - Utility function
       * @returns void
       */
      discountPercent: item.discountPercent,
      artworkName: item.artworkName,
      artworkImageUrl: item.artworkImageUrl,
    }))

  const customItems = draft.items
    .filter((item): item is CustomLineItem => item.type === 'custom')
    .map((item) => ({
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      discountPercent: item.discountPercent,
    }))

  /**
   * customItems - Utility function
   * @returns void
   */
  // Build collector object
  const collector = {
    name: draft.buyer.name || '',
    email: draft.buyer.email || '',
    phone: draft.buyer.phone || undefined,
    message: draft.buyer.message || undefined,
  }

  // Build final payload
  const payload: CreateInvoiceRequest = {
    artworks,
    customItems,
    collector,
    /**
     * collector - Utility function
     * @returns void
     */
    isQuickSell: true, // Always true for Quick Sell flow
    isApplySalesTax: draft.isApplySalesTax,
    taxPercent: draft.isApplySalesTax ? draft.taxPercent : undefined,
    taxZipcode: draft.taxZipCode || undefined,
    shippingFee: draft.shippingFee,
    isArtistHandlesShipping: draft.isArtistHandlesShipping,
  }

  // Debug log in development
  if (DEBUG_PAYLOAD) {
    console.log('[Quick Sell] Create Invoice Payload:', JSON.stringify(payload, null, 2))
    /**
     * payload - Utility function
     * @returns void
     */
  }

  return payload
}
