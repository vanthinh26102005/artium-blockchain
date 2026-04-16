import { apiFetch } from '@shared/services/apiClient'
import type { OrderApiItem } from '@shared/types/order'

const orderApi = {
  getOrderByOnChainOrderId: (onChainOrderId: string) =>
    apiFetch<OrderApiItem>(`/orders/on-chain/${encodeURIComponent(onChainOrderId)}`, {
      cache: 'no-store',
    }),
}

export default orderApi
