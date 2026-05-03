// react
import { useCallback, useState } from 'react'

// @shared - apis
import invoiceApis from '@shared/apis/invoiceApis'
import type { CreateInvoiceResponse } from '@shared/apis/invoiceApis'

// @domains - quick-sell
import type { QuickSellInvoiceDraft } from '../types/quickSellDraft'
import type { CheckoutInvoice } from '../types/checkoutTypes'
import { mapCreateInvoicePayload } from '../utils/mapCreateInvoicePayload'
import { saveInvoiceToStorage } from '../utils/checkoutStorage'

type CreateInvoiceResult = {
  invoiceCode: string
  invoice: CreateInvoiceResponse
}

type UseCreateQuickSellInvoiceReturn = {
  createInvoice: (draft: QuickSellInvoiceDraft) => Promise<CreateInvoiceResult>
  isLoading: boolean
  error: Error | null
  reset: () => void
}

/**
 * useCreateQuickSellInvoice - Custom React hook
 * @returns void
 */
export const useCreateQuickSellInvoice = (): UseCreateQuickSellInvoiceReturn => {
  // -- state --
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // -- handlers --
  const reset = useCallback(() => {
    setError(null)
    setIsLoading(false)
/**
 * reset - Utility function
 * @returns void
 */
  }, [])

  const createInvoice = useCallback(
    async (draft: QuickSellInvoiceDraft): Promise<CreateInvoiceResult> => {
      setIsLoading(true)
      setError(null)

      try {
/**
 * createInvoice - Utility function
 * @returns void
 */
        // Map draft to API payload
        const payload = mapCreateInvoicePayload(draft)

        // Call API
        const response = await invoiceApis.createQuickSellInvoice(payload)

        // Map to CheckoutInvoice and save to localStorage
        const checkoutInvoice: CheckoutInvoice = {
          id: response.id || `invoice-${Date.now()}`,
          invoiceCode: response.invoiceCode,
/**
 * payload - Utility function
 * @returns void
 */
          status: 'UNPAID',
          items: response.invoiceItems.map((item, i) => ({
            id: item.id,
            type: item.type === 'Artium-artwork' ? 'artwork' : 'custom',
            name: item.artworkName || `Item ${i + 1}`,
            title: item.artworkName,
/**
 * response - Utility function
 * @returns void
 */
            price: item.salePrice,
            quantity: item.quantity || 1,
            discountPercent: item.discountPercentage,
            imageUrl: item.artworkImageUrl,
            artworkName: item.artworkName,
            artworkImageUrl: item.artworkImageUrl,
/**
 * checkoutInvoice - Utility function
 * @returns void
 */
          })),
          buyer: draft.buyer.name
            ? {
                name: draft.buyer.name,
                email: draft.buyer.email,
                message: draft.buyer.message,
              }
            : undefined,
          subtotal: draft.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
          discountTotal: draft.items.reduce((sum, item) => {
            const basePrice = item.price * item.quantity
            return sum + (basePrice * item.discountPercent) / 100
          }, 0),
          shipping: 0,
          taxPercent: draft.isApplySalesTax ? (draft.taxPercent ?? 0) : 0,
          tax: 0,
          total: response.totalAmount,
          createdAt: new Date().toISOString(),
        }

        saveInvoiceToStorage(checkoutInvoice)

        setIsLoading(false)

        return {
          invoiceCode: response.invoiceCode,
          invoice: response,
        }
/**
 * basePrice - Utility function
 * @returns void
 */
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create invoice')
        setError(error)
        setIsLoading(false)
        throw error
      }
    },
    [],
  )

  return {
    createInvoice,
    isLoading,
    error,
    reset,
  }
}

/**
 * error - Utility function
 * @returns void
 */