import { useRouter } from 'next/router'
import { Metadata } from '@/components/SEO/Metadata'
import { OnChainOrderDetailPageView } from '@domains/orders/views/OnChainOrderDetailPageView'
import type { NextPageWithLayout } from '@shared/types/next'

const getQueryValue = (value: string | string[] | undefined) => {
  if (typeof value === 'string') {
    return value
  }

  return Array.isArray(value) ? value[0] : undefined
}

const OnChainOrderDetailRoute: NextPageWithLayout = () => {
  const router = useRouter()
  const { demo, onChainOrderId } = router.query
  const onChainOrderIdStr = typeof onChainOrderId === 'string' ? onChainOrderId : undefined
  const isDemoMode = demo === '1' || (Array.isArray(demo) && demo.includes('1'))
  const demoArtworkId = getQueryValue(router.query.demoArtworkId)
  const demoArtworkTitle = getQueryValue(router.query.demoArtworkTitle)
  const demoArtworkImageUrl = getQueryValue(router.query.demoArtworkImageUrl)
  const demoBidEth = getQueryValue(router.query.demoBidEth)
  const demoTransactionHash = getQueryValue(router.query.demoTransactionHash)

  if (!router.isReady || !onChainOrderIdStr) {
    return null
  }

  return (
    <>
      <Metadata title={`${isDemoMode ? 'Demo ' : ''}On-Chain Order ${onChainOrderIdStr} | Artium`} />
      <OnChainOrderDetailPageView
        onChainOrderId={onChainOrderIdStr}
        isDemoMode={isDemoMode}
        demoArtworkId={demoArtworkId}
        demoArtworkTitle={demoArtworkTitle}
        demoArtworkImageUrl={demoArtworkImageUrl}
        demoBidEth={demoBidEth}
        demoTransactionHash={demoTransactionHash}
      />
    </>
  )
}

export default OnChainOrderDetailRoute
