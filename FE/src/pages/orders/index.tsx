import dynamic from 'next/dynamic'
import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'
import { useRequireAuth } from '@domains/auth/hooks/useRequireAuth'

/**
 * OrdersPageView - React component
 * @returns React element
 */
const OrdersPageView = dynamic(
  () => import('@domains/orders/views/OrdersPageView').then((module) => module.OrdersPageView),
  { ssr: false },
)

const OrdersRoute: NextPageWithLayout = () => {
  const { canRenderProtected } = useRequireAuth()

/**
 * OrdersRoute - React component
 * @returns React element
 */
  if (!canRenderProtected) {
    return null
  }

  return <OrdersPageView />
}

OrdersRoute.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default OrdersRoute
