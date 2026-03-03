// Quick Sell - Checkout Persistence
// Store/retrieve invoice and checkout draft from localStorage

import type { CheckoutInvoice, CheckoutDraft, InvoicePaymentStatus } from '../types/checkoutTypes'

const STORAGE_KEY_PREFIX = 'artium.quickSell'

const getInvoiceStorageKey = (invoiceCode: string) =>
  `${STORAGE_KEY_PREFIX}.invoiceByCode.${invoiceCode}`

const getDraftStorageKey = (invoiceCode: string) =>
  `${STORAGE_KEY_PREFIX}.checkoutDraftByCode.${invoiceCode}`

// --- Invoice Storage ---

export const saveInvoiceToStorage = (invoice: CheckoutInvoice): void => {
  if (typeof window === 'undefined') return

  try {
    const key = getInvoiceStorageKey(invoice.invoiceCode)
    localStorage.setItem(key, JSON.stringify(invoice))
  } catch (error) {
    console.error('[Quick Sell] Failed to save invoice:', error)
  }
}

export const getInvoiceFromStorage = (invoiceCode: string): CheckoutInvoice | null => {
  if (typeof window === 'undefined') return null

  try {
    const key = getInvoiceStorageKey(invoiceCode)
    const data = localStorage.getItem(key)
    if (!data) return null

    return JSON.parse(data) as CheckoutInvoice
  } catch (error) {
    console.error('[Quick Sell] Failed to get invoice:', error)
    return null
  }
}

export const updateInvoiceStatus = (
  invoiceCode: string,
  status: InvoicePaymentStatus,
): CheckoutInvoice | null => {
  const invoice = getInvoiceFromStorage(invoiceCode)
  if (!invoice) return null

  const updated = { ...invoice, status }
  saveInvoiceToStorage(updated)
  return updated
}

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

// --- Checkout Draft Storage ---

export const saveCheckoutDraft = (invoiceCode: string, draft: CheckoutDraft): void => {
  if (typeof window === 'undefined') return

  try {
    const key = getDraftStorageKey(invoiceCode)
    localStorage.setItem(key, JSON.stringify(draft))
  } catch (error) {
    console.error('[Quick Sell] Failed to save checkout draft:', error)
  }
}

export const getCheckoutDraft = (invoiceCode: string): CheckoutDraft | null => {
  if (typeof window === 'undefined') return null

  try {
    const key = getDraftStorageKey(invoiceCode)
    const data = localStorage.getItem(key)
    if (!data) return null

    return JSON.parse(data) as CheckoutDraft
  } catch (error) {
    console.error('[Quick Sell] Failed to get checkout draft:', error)
    return null
  }
}

// --- List All Invoices (for debugging) ---

export const getAllStoredInvoices = (): CheckoutInvoice[] => {
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
      }
    }
  } catch (error) {
    console.error('[Quick Sell] Failed to list invoices:', error)
  }

  return invoices
}
