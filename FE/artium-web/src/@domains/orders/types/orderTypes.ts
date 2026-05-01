import type { OrderItemResponse, OrderResponse, OrderScope } from '@shared/apis/orderApis'

export type OrdersWorkspaceScope = OrderScope

export type OrderActorRole = 'buyer' | 'seller'

export type OrderWithItems = OrderResponse & {
  items: OrderItemResponse[]
}

export type OrderTimelineStep = {
  key: string
  label: string
  description: string
  date?: string | null
  state: 'complete' | 'current' | 'upcoming'
}
