import { useRouter } from 'next/router'
import { Metadata } from '@/components/SEO/Metadata'
import { OnChainOrderDetailPageView } from '@domains/orders/views/OnChainOrderDetailPageView'
import type { NextPageWithLayout } from '@shared/types/next'

const OnChainOrderDetailRoute: NextPageWithLayout = () => {
  const router = useRouter()
  const { onChainOrderId } = router.query
  const onChainOrderIdStr = typeof onChainOrderId === 'string' ? onChainOrderId : undefined

  if (!router.isReady || !onChainOrderIdStr) {
    return null
  }

  return (
    <>
      <Metadata title={`On-Chain Order ${onChainOrderIdStr} | Artium`} />
      <OnChainOrderDetailPageView onChainOrderId={onChainOrderIdStr} />
    </>
  )
}

export default OnChainOrderDetailRoute
