import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import type { OrderResponse } from '@shared/apis/orderApis'
import type { OrdersWorkspaceScope } from '../types/orderTypes'
import {
  formatOrderDate,
  formatOrderMoney,
  getNextActionLabel,
  getOrderActorRole,
  getPaymentMethodLabel,
  getPrimaryArtwork,
} from '../utils/orderPresentation'
import { OrderStatusBadge } from './OrderStatusBadge'

type OrderListCardProps = {
  order: OrderResponse
  scope: OrdersWorkspaceScope
  currentUserId?: string | null
}

export const OrderListCard = ({ order, scope, currentUserId }: OrderListCardProps) => {
  const primaryArtwork = getPrimaryArtwork(order.items)
  const role = getOrderActorRole(order, currentUserId, scope)

  return (
    <Link
      href={{
        pathname: `/orders/${order.id}`,
        query: { scope },
      }}
      className="group block rounded-[28px] border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
            {primaryArtwork?.artworkImageUrl ? (
              <Image
                src={primaryArtwork.artworkImageUrl}
                alt={primaryArtwork.artworkTitle}
                width={80}
                height={80}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Art
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-semibold text-slate-900 transition group-hover:text-blue-700">
                {order.orderNumber}
              </h3>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-1 truncate text-sm text-slate-900">
              {primaryArtwork?.artworkTitle ?? 'Artwork details available on the order detail page'}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Created {formatOrderDate(order.createdAt)} • {getPaymentMethodLabel(order.paymentMethod)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-5 md:block md:text-right">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Total
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {formatOrderMoney(order.totalAmount, order.currency)}
            </p>
          </div>
          <div className="md:mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Next step
            </p>
            <div className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
              {getNextActionLabel(order, role)}
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
