import { cn } from '@shared/lib/utils'
import type { OrdersWorkspaceScope } from '../types/orderTypes'

type OrdersSegmentedControlProps = {
  value: OrdersWorkspaceScope
  onChange: (value: OrdersWorkspaceScope) => void
}

const OPTIONS: Array<{ label: string; value: OrdersWorkspaceScope }> = [
  { label: 'Purchases', value: 'buyer' },
  { label: 'Sales', value: 'seller' },
]

export const OrdersSegmentedControl = ({ value, onChange }: OrdersSegmentedControlProps) => {
  return (
    <div className="inline-flex rounded-full bg-slate-100 p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-full px-5 py-2 text-sm font-semibold transition',
            value === option.value
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
