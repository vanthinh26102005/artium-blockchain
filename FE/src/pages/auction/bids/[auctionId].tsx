import { useRouter } from 'next/router'
import { Metadata } from '@/components/SEO/Metadata'
import { AuctionBidTrackerPage } from '@domains/auction/views/AuctionBidTrackerPage'
import type { NextPageWithLayout } from '@shared/types/next'

const AuctionBidTrackerRoute: NextPageWithLayout = () => {
  const router = useRouter()
  const { auctionId } = router.query
  const auctionIdStr = typeof auctionId === 'string' ? auctionId : undefined

  if (!router.isReady || !auctionIdStr) {
    return null
  }

  return (
    <>
      <Metadata title={`Bid Tracker ${auctionIdStr} | Artium`} />
      <AuctionBidTrackerPage auctionId={auctionIdStr} />
    </>
  )
}

export default AuctionBidTrackerRoute
