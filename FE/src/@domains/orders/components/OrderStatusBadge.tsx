import { Badge } from '@shared/components/ui/badge'
import { cn } from '@shared/lib/utils'
import { getOrderStatusLabel, getStatusTone } from '../utils/orderPresentation'

type OrderStatusBadgeProps = {
  status?: string | null
}

/**
 * OrderStatusBadge - React component
 * @returns React element
 */
export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={cn('border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]', getStatusTone(status))}
    >
      {getOrderStatusLabel(status)}
    </Badge>
  )
}
