import { useRouter } from 'next/router'
import { Metadata } from '@/components/SEO/Metadata'
import { OnChainOrderDetailPageView } from '@domains/orders/views/OnChainOrderDetailPageView'
import type { NextPageWithLayout } from '@shared/types/next'

const OnChainOrderDetailRoute: NextPageWithLayout = () => {
  const router = useRouter()
  const { demo, onChainOrderId } = router.query
  const onChainOrderIdStr = typeof onChainOrderId === 'string' ? onChainOrderId : undefined
  const isDemoMode =
    demo === '1' || (Array.isArray(demo) && demo.includes('1'))

  if (!router.isReady || !onChainOrderIdStr) {
    return null
  }

  return (
    <>
      <Metadata title={`${isDemoMode ? 'Demo ' : ''}On-Chain Order ${onChainOrderIdStr} | Artium`} />
      <OnChainOrderDetailPageView onChainOrderId={onChainOrderIdStr} isDemoMode={isDemoMode} />
    </>
  )
}

export default OnChainOrderDetailRoute
