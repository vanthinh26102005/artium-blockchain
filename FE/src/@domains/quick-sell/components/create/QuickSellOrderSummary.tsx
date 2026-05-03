// @domains - quick-sell
import type { InvoiceTotals } from '../../types/quickSellDraft'
import { formatMoney } from '../../utils/pricing'

type QuickSellOrderSummaryProps = {
  totals: InvoiceTotals
  showTax?: boolean
  showShipping?: boolean
}

/**
 * QuickSellOrderSummary - React component
 * @returns React element
 */
export const QuickSellOrderSummary = ({
  totals,
  showTax = true,
  showShipping = true,
}: QuickSellOrderSummaryProps) => {
  // -- render --
  return (
    <div className="space-y-3">
      {/* Subtotal */}
      <div className="flex justify-between text-sm">
        <span className="text-slate-600">Subtotal</span>
        <span className="text-slate-900">{formatMoney(totals.subtotal)}</span>
      </div>

      {/* Discount */}
      {totals.discountTotal > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Discount</span>
          <span className="text-green-600">-{formatMoney(totals.discountTotal)}</span>
        </div>
      )}

      {/* Shipping */}
      {showShipping && (
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Shipping</span>
          <span className="text-slate-900">
            {totals.shipping === 0 ? 'Free' : formatMoney(totals.shipping)}
          </span>
        </div>
      )}

      {/* Tax */}
      {showTax && totals.tax > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Tax</span>
          <span className="text-slate-900">{formatMoney(totals.tax)}</span>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-slate-200 pt-3">
        {/* Total */}
        <div className="flex justify-between">
          <span className="text-base font-semibold text-slate-900">Total</span>
          <span className="text-lg font-bold text-slate-900">{formatMoney(totals.total)}</span>
        </div>
      </div>
    </div>
  )
}
