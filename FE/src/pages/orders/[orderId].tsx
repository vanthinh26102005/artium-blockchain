import dynamic from 'next/dynamic'
import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'
import { useRequireAuth } from '@domains/auth/hooks/useRequireAuth'

/**
 * OrderDetailPageView - React component
 * @returns React element
 */
const OrderDetailPageView = dynamic(
  () =>
    import('@domains/orders/views/OrderDetailPageView').then(
      (module) => module.OrderDetailPageView,
    ),
  { ssr: false },
)

const OrderDetailRoute: NextPageWithLayout = () => {
  const { canRenderProtected } = useRequireAuth()

  /**
   * OrderDetailRoute - React component
   * @returns React element
   */
  if (!canRenderProtected) {
    return null
  }

  return <OrderDetailPageView />
}

OrderDetailRoute.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default OrderDetailRoute
