// Quick Sell - Status Banner component
// Shows payment status with appropriate styling

import type { InvoicePaymentStatus } from '../../types/checkoutTypes'

type QuickSellCheckoutStatusBannerProps = {
  status: InvoicePaymentStatus
  invoiceCode: string
}

/**
 * QuickSellCheckoutStatusBanner - React component
 * @returns React element
 */
export const QuickSellCheckoutStatusBanner = ({
  status,
  invoiceCode,
}: QuickSellCheckoutStatusBannerProps) => {
  if (status === 'UNPAID') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
            <span className="text-xl">💳</span>
          </div>
          <div>
            <p className="font-semibold text-amber-900">Awaiting Payment</p>
            <p className="text-sm text-amber-700">Invoice {invoiceCode} is ready for payment</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'PENDING') {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-5 w-5 animate-spin text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-blue-900">Processing Payment</p>
            <p className="text-sm text-blue-700">Please wait while we confirm your payment...</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'PAID') {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <span className="text-xl">✓</span>
          </div>
          <div>
            <p className="font-semibold text-green-900">Payment Complete</p>
            <p className="text-sm text-green-700">Thank you! Invoice {invoiceCode} has been paid</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
