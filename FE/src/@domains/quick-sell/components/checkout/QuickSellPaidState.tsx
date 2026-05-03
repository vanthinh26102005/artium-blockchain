// react
import { Check, Download, ArrowLeft, Package } from 'lucide-react'
import Link from 'next/link'

// @shared - components
import { Button } from '@shared/components/ui/button'

// @domains - quick-sell
import { QuickSellCheckoutOrderSummary } from './QuickSellCheckoutOrderSummary'

type QuickSellPaidStateProps = {
  invoiceCode: string
  items: any[]
  totals: {
    subtotal: number
    discountTotal: number
    shipping: number
    taxPercent: number
    tax: number
    total: number
  }
  returnHref?: string
  returnLabel?: string
}

/**
 * QuickSellPaidState - React component
 * @returns React element
 */
export const QuickSellPaidState = ({
  invoiceCode,
  items,
  totals,
  returnHref = '/artist/invoices',
  returnLabel = 'Return to Artist Page',
}: QuickSellPaidStateProps) => {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Success Banner */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center duration-500 animate-in fade-in zoom-in">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check className="h-8 w-8 text-green-600" strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-bold text-green-900">Payment Complete</h2>
        <p className="mt-2 text-green-800">
          Thank you! Invoice #{invoiceCode} has been paid successfully.
        </p>
        <p className="mt-1 text-sm text-green-700">A receipt has been sent to your email.</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button className="flex-1 gap-2" variant="outline">
          <Download className="h-4 w-4" />
          Download Receipt
        </Button>
      </div>

      {/* Final Order Summary */}
      <QuickSellCheckoutOrderSummary
        items={items}
        subtotal={totals.subtotal}
        discountTotal={totals.discountTotal}
        shipping={totals.shipping}
        taxPercent={totals.taxPercent}
        tax={totals.tax}
        total={totals.total}
      />

      {/* Next Steps / Back Links */}
      <div className="space-y-4 rounded-lg bg-slate-50 p-6">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900">
          <Package className="h-5 w-5 text-slate-500" />
          What happens next?
        </h3>
        <ul className="ml-7 list-disc space-y-2 text-sm text-slate-600">
          <li>The artist has been notified of your payment.</li>
          <li>Your items will be prepared for shipment within 3-5 business days.</li>
          <li>You will receive a tracking number via email once shipped.</li>
        </ul>
      </div>

      <div className="flex justify-center">
        <Button asChild variant="link" className="text-slate-500 hover:text-slate-900">
          <Link href={returnHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {returnLabel}
          </Link>
        </Button>
      </div>
    </div>
  )
}
