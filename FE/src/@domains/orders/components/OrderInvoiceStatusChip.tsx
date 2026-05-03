import { AlertCircle, Loader2, ReceiptText, RefreshCcw } from 'lucide-react'
import { Badge } from '@shared/components/ui/badge'
import { cn } from '@shared/lib/utils'
import type { OrderInvoiceAvailability } from '../utils/orderInvoicePresentation'

type OrderInvoiceStatusChipProps = {
  availability: OrderInvoiceAvailability
  className?: string
}

/**
 * toneByState - Utility function
 * @returns void
 */
const toneByState: Record<OrderInvoiceAvailability['state'], string> = {
  checking: 'border-amber-200 bg-amber-50 text-amber-700',
  ready: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  unavailable: 'border-slate-200 bg-slate-50 text-slate-600',
  retry: 'border-rose-200 bg-rose-50 text-rose-700',
}

const iconByState = {
  checking: Loader2,
  ready: ReceiptText,
/**
 * iconByState - Utility function
 * @returns void
 */
  unavailable: AlertCircle,
  retry: RefreshCcw,
}

export const OrderInvoiceStatusChip = ({
  availability,
  className,
}: OrderInvoiceStatusChipProps) => {
  const Icon = iconByState[availability.state]

/**
 * OrderInvoiceStatusChip - React component
 * @returns React element
 */
  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]',
        toneByState[availability.state],
        className,
/**
 * Icon - React component
 * @returns React element
 */
      )}
      title={availability.description}
    >
      <Icon className={cn('h-3.5 w-3.5', availability.state === 'checking' && 'animate-spin')} />
      {availability.label}
    </Badge>
  )
}
