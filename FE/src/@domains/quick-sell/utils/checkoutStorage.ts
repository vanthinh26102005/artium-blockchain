// Quick Sell - Checkout Persistence
// Store/retrieve invoice and checkout draft from localStorage

import type { CheckoutInvoice, CheckoutDraft, InvoicePaymentStatus } from '../types/checkoutTypes'

/**
 * STORAGE_KEY_PREFIX - React component
 * @returns React element
 */
const STORAGE_KEY_PREFIX = 'artium.quickSell'

const getInvoiceStorageKey = (invoiceCode: string) =>
  `${STORAGE_KEY_PREFIX}.invoiceByCode.${invoiceCode}`

/**
 * getInvoiceStorageKey - Utility function
 * @returns void
 */
const getDraftStorageKey = (invoiceCode: string) =>
  `${STORAGE_KEY_PREFIX}.checkoutDraftByCode.${invoiceCode}`

// --- Invoice Storage ---

export const saveInvoiceToStorage = (invoice: CheckoutInvoice): void => {
  /**
   * getDraftStorageKey - Utility function
   * @returns void
   */
  if (typeof window === 'undefined') return

  try {
    const key = getInvoiceStorageKey(invoice.invoiceCode)
    localStorage.setItem(key, JSON.stringify(invoice))
  } catch (error) {
    console.error('[Quick Sell] Failed to save invoice:', error)
  }
  /**
   * saveInvoiceToStorage - Utility function
   * @returns void
   */
}

export const getInvoiceFromStorage = (invoiceCode: string): CheckoutInvoice | null => {
  if (typeof window === 'undefined') return null

  try {
    const key = getInvoiceStorageKey(invoiceCode)
    /**
     * key - Utility function
     * @returns void
     */
    const data = localStorage.getItem(key)
    if (!data) return null

    return JSON.parse(data) as CheckoutInvoice
  } catch (error) {
    console.error('[Quick Sell] Failed to get invoice:', error)
    return null
  }
}

/**
 * getInvoiceFromStorage - Utility function
 * @returns void
 */
export const updateInvoiceStatus = (
  invoiceCode: string,
  status: InvoicePaymentStatus,
): CheckoutInvoice | null => {
  const invoice = getInvoiceFromStorage(invoiceCode)
  if (!invoice) return null

  /**
   * key - Utility function
   * @returns void
   */
  const updated = { ...invoice, status }
  saveInvoiceToStorage(updated)
  return updated
}
/**
 * data - Utility function
 * @returns void
 */

export const deleteInvoiceFromStorage = (invoiceCode: string): void => {
  if (typeof window === 'undefined') return

  try {
    const invoiceKey = getInvoiceStorageKey(invoiceCode)
    const draftKey = getDraftStorageKey(invoiceCode)
    localStorage.removeItem(invoiceKey)
    localStorage.removeItem(draftKey)
  } catch (error) {
    console.error('[Quick Sell] Failed to delete invoice:', error)
  }
}
/**
 * updateInvoiceStatus - Utility function
 * @returns void
 */

// --- Checkout Draft Storage ---

export const saveCheckoutDraft = (invoiceCode: string, draft: CheckoutDraft): void => {
  if (typeof window === 'undefined') return

  try {
    /**
     * invoice - Utility function
     * @returns void
     */
    const key = getDraftStorageKey(invoiceCode)
    localStorage.setItem(key, JSON.stringify(draft))
  } catch (error) {
    console.error('[Quick Sell] Failed to save checkout draft:', error)
  }
}
/**
 * updated - Utility function
 * @returns void
 */

export const getCheckoutDraft = (invoiceCode: string): CheckoutDraft | null => {
  if (typeof window === 'undefined') return null

  try {
    const key = getDraftStorageKey(invoiceCode)
    const data = localStorage.getItem(key)
    if (!data) return null
    /**
     * deleteInvoiceFromStorage - Utility function
     * @returns void
     */

    return JSON.parse(data) as CheckoutDraft
  } catch (error) {
    console.error('[Quick Sell] Failed to get checkout draft:', error)
    return null
  }
}
/**
 * invoiceKey - Utility function
 * @returns void
 */

// --- List All Invoices (for debugging) ---

export const getAllStoredInvoices = (): CheckoutInvoice[] => {
  /**
   * draftKey - Utility function
   * @returns void
   */
  if (typeof window === 'undefined') return []

  const invoices: CheckoutInvoice[] = []
  const prefix = `${STORAGE_KEY_PREFIX}.invoiceByCode.`

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(prefix)) {
        const data = localStorage.getItem(key)
        if (data) {
          invoices.push(JSON.parse(data))
        }
        /**
         * saveCheckoutDraft - Utility function
         * @returns void
         */
      }
    }
  } catch (error) {
    console.error('[Quick Sell] Failed to list invoices:', error)
  }

  return invoices
  /**
   * key - Utility function
   * @returns void
   */
}

/**
 * getCheckoutDraft - Utility function
 * @returns void
 */
/**
 * key - Utility function
 * @returns void
 */
/**
 * data - Utility function
 * @returns void
 */
/**
 * getAllStoredInvoices - Utility function
 * @returns void
 */
/**
 * invoices - Utility function
 * @returns void
 */
/**
 * prefix - Utility function
 * @returns void
 */
/**
 * key - Utility function
 * @returns void
 */
/**
 * data - Utility function
 * @returns void
 */
