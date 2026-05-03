import type {
  OrderInvoiceAddressResponse,
  OrderInvoiceResponse,
  OrderResponse,
} from '@shared/apis/orderApis'
import {
  formatOrderDate,
  formatOrderDateTime,
  formatOrderMoney,
} from './orderPresentation'

export type OrderInvoiceAvailabilityState = 'checking' | 'ready' | 'unavailable' | 'retry'

export type OrderInvoiceAvailability = {
  state: OrderInvoiceAvailabilityState
  label: string
  description: string
  canPreview: boolean
  canPrint: boolean
  reason?: string
}

/**
 * INVOICE_UNAVAILABLE_COPY - React component
 * @returns React element
 */
export const INVOICE_UNAVAILABLE_COPY = 'Invoice unavailable for this workspace.'
export const INVOICE_MISSING_FIELD_COPY = 'Not provided'
export const INVOICE_REDACTED_FIELD_COPY = 'Redacted by access rules'

/**
 * INVOICE_MISSING_FIELD_COPY - React component
 * @returns React element
 */
const RETRY_COPY = 'Unable to load invoice. Try again without leaving this order.'

const isNonDisclosingUnavailableError = (message?: string | null) => {
  const normalized = message?.toLowerCase() ?? ''
/**
 * INVOICE_REDACTED_FIELD_COPY - React component
 * @returns React element
 */

  return (
    normalized.includes('not found') ||
    normalized.includes('forbidden') ||
    normalized.includes('unauthorized') ||
/**
 * RETRY_COPY - React component
 * @returns React element
 */
    normalized.includes('404')
  )
}

export const getOrderInvoiceAvailability = ({
/**
 * isNonDisclosingUnavailableError - Utility function
 * @returns void
 */
  invoice,
  isLoading,
  errorMessage,
  isUnavailable,
/**
 * normalized - Utility function
 * @returns void
 */
}: {
  invoice: OrderInvoiceResponse | null
  isLoading: boolean
  errorMessage?: string | null
  isUnavailable?: boolean
}): OrderInvoiceAvailability => {
  if (invoice) {
    return {
      state: 'ready',
      label: 'Invoice ready',
      description: 'Preview or print the backend invoice for this order.',
      canPreview: true,
      canPrint: true,
/**
 * getOrderInvoiceAvailability - Utility function
 * @returns void
 */
    }
  }

  if (isLoading) {
    return {
      state: 'checking',
      label: 'Checking invoice',
      description: 'Checking invoice availability.',
      canPreview: false,
      canPrint: false,
    }
  }

  if (isUnavailable || isNonDisclosingUnavailableError(errorMessage)) {
    return {
      state: 'unavailable',
      label: 'Invoice unavailable',
      description: INVOICE_UNAVAILABLE_COPY,
      canPreview: false,
      canPrint: false,
      reason: INVOICE_UNAVAILABLE_COPY,
    }
  }

  if (errorMessage) {
    return {
      state: 'retry',
      label: 'Retry invoice',
      description: RETRY_COPY,
      canPreview: false,
      canPrint: false,
      reason: RETRY_COPY,
    }
  }

  return {
    state: 'unavailable',
    label: 'Invoice unavailable',
    description: 'This order does not have invoice data available for your workspace yet.',
    canPreview: false,
    canPrint: false,
    reason: 'Invoice unavailable',
  }
}

export const getOrderListInvoiceAvailability = (order: OrderResponse): OrderInvoiceAvailability => {
  if (order.id && order.orderNumber) {
    return {
      state: 'ready',
      label: 'Invoice ready',
      description: 'Open invoice details for this order.',
      canPreview: true,
      canPrint: false,
    }
  }

  return {
    state: 'unavailable',
    label: 'Invoice unavailable',
    description: 'Invoice unavailable',
    canPreview: false,
    canPrint: false,
    reason: 'Invoice unavailable',
  }
}

/**
 * getOrderListInvoiceAvailability - Utility function
 * @returns void
 */
export const formatInvoiceField = (value?: string | number | null): string => {
  if (value === null || value === undefined) {
    return INVOICE_MISSING_FIELD_COPY
  }

  const normalized = String(value).trim()
  return normalized.length > 0 ? normalized : INVOICE_MISSING_FIELD_COPY
}

export const formatInvoicePartyField = (value?: string | null, redacted?: boolean): string => {
  if (redacted) {
    return INVOICE_REDACTED_FIELD_COPY
  }

  return formatInvoiceField(value)
}

const getAddressValue = (
  address: OrderInvoiceAddressResponse | Record<string, unknown>,
  key: keyof OrderInvoiceAddressResponse,
) => {
  const value = address[key]

  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
/**
 * formatInvoiceField - Utility function
 * @returns void
 */
}

export const formatInvoiceAddressLines = (
  address?: OrderInvoiceAddressResponse | Record<string, unknown> | null,
): string[] => {
  if (!address) {
    return []
  }
/**
 * normalized - Utility function
 * @returns void
 */

  const city = getAddressValue(address, 'city')
  const state = getAddressValue(address, 'state')
  const postalCode = getAddressValue(address, 'postalCode')
  const country = getAddressValue(address, 'country')
  const cityState = `${city ?? ''}${city && state ? ', ' : ''}${state ?? ''}`.trim()
  const postalCountry = `${postalCode ?? ''} ${country ?? ''}`.trim()
/**
 * formatInvoicePartyField - Utility function
 * @returns void
 */

  return [
    getAddressValue(address, 'name'),
    getAddressValue(address, 'line1'),
    getAddressValue(address, 'line2'),
    cityState,
    postalCountry,
    getAddressValue(address, 'phone'),
  ].filter((line): line is string => Boolean(line))
}

/**
 * getAddressValue - Utility function
 * @returns void
 */
export const canPrintOrderInvoice = (availability: OrderInvoiceAvailability): boolean =>
  availability.state === 'ready' && availability.canPrint

export const formatInvoiceMoney = formatOrderMoney
export const formatInvoiceDate = formatOrderDate
export const formatInvoiceDateTime = formatOrderDateTime

/**
 * value - Utility function
 * @returns void
 */
/**
 * formatInvoiceAddressLines - Utility function
 * @returns void
 */
/**
 * city - Utility function
 * @returns void
 */
/**
 * state - Utility function
 * @returns void
 */
/**
 * postalCode - Utility function
 * @returns void
 */
/**
 * country - Utility function
 * @returns void
 */
/**
 * cityState - Utility function
 * @returns void
 */
/**
 * postalCountry - Utility function
 * @returns void
 */
/**
 * canPrintOrderInvoice - Utility function
 * @returns void
 */
/**
 * formatInvoiceMoney - Utility function
 * @returns void
 */
/**
 * formatInvoiceDate - Utility function
 * @returns void
 */
/**
 * formatInvoiceDateTime - Utility function
 * @returns void
 */