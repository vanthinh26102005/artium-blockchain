// Quick Sell - Order Summary for Checkout
// Shows subtotal, discount, shipping, tax, and total

import { formatMoney } from '../../utils/pricing'

type QuickSellCheckoutOrderSummaryProps = {
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    discountPercent: number
    imageUrl?: string
  }>
  subtotal: number
  discountTotal: number
  shipping: number
  taxPercent: number
  tax: number
  total: number
}

/**
 * QuickSellCheckoutOrderSummary - React component
 * @returns React element
 */
export const QuickSellCheckoutOrderSummary = ({
  items,
  subtotal,
  discountTotal,
  shipping,
  taxPercent,
  tax,
  total,
}: QuickSellCheckoutOrderSummaryProps) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Order Summary</h2>

      {/* Items List */}
      <div className="space-y-3 border-b border-slate-200 pb-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 rounded-lg bg-slate-100">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full rounded-lg object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-500">
                Qty: {item.quantity}
                {item.discountPercent > 0 && (
                  <span className="ml-2 text-green-600">-{item.discountPercent}%</span>
                )}
              </p>
            </div>
            <p className="text-sm font-medium text-slate-900">
              {formatMoney(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Subtotal</span>
          <span className="text-slate-900">{formatMoney(subtotal)}</span>
        </div>

        {discountTotal > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Discount</span>
            <span className="text-green-600">-{formatMoney(discountTotal)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Shipping</span>
          <span className="text-slate-900">{shipping === 0 ? 'Free' : formatMoney(shipping)}</span>
        </div>

        {tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Tax ({taxPercent.toFixed(2)}%)</span>
            <span className="text-slate-900">{formatMoney(tax)}</span>
          </div>
        )}

        <div className="border-t border-slate-200 pt-2">
          <div className="flex justify-between">
            <span className="text-base font-semibold text-slate-900">Total</span>
            <span className="text-lg font-bold text-slate-900">{formatMoney(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
