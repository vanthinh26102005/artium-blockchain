import { useRouter } from 'next/router'
import { Metadata } from '@/components/SEO/Metadata'
import { OnChainOrderDetailPageView } from '@domains/orders/views/OnChainOrderDetailPageView'
import type { NextPageWithLayout } from '@shared/types/next'

/**
 * OnChainOrderDetailRoute - React component
 * @returns React element
 */
const OnChainOrderDetailRoute: NextPageWithLayout = () => {
  const router = useRouter()
  const { onChainOrderId } = router.query
  const onChainOrderIdStr = typeof onChainOrderId === 'string' ? onChainOrderId : undefined
  /**
   * router - Utility function
   * @returns void
   */

  if (!router.isReady || !onChainOrderIdStr) {
    return null
  }

  /**
   * onChainOrderIdStr - Utility function
   * @returns void
   */
  return (
    <>
      <Metadata title={`On-Chain Order ${onChainOrderIdStr} | Artium`} />
      <OnChainOrderDetailPageView onChainOrderId={onChainOrderIdStr} />
    </>
  )
}

export default OnChainOrderDetailRoute
