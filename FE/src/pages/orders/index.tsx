import dynamic from 'next/dynamic'
import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'
import { useRequireAuth } from '@domains/auth/hooks/useRequireAuth'

const OrdersPageView = dynamic(
  () => import('@domains/orders/views/OrdersPageView').then((module) => module.OrdersPageView),
  { ssr: false },
)

const OrdersRoute: NextPageWithLayout = () => {
  const { canRenderProtected } = useRequireAuth()

  if (!canRenderProtected) {
    return null
  }

  return <OrdersPageView />
}

OrdersRoute.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default OrdersRoute
