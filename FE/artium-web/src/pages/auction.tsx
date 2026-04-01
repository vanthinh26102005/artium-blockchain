import type { NextPageWithLayout } from '@shared/types/next'
import { SiteHeader } from '@shared/components/layout/SiteHeader'
import { LiveAuctionPage } from '@/views/LiveAuctionPage'

const AuctionRoute: NextPageWithLayout = () => {
  return <LiveAuctionPage />
}

AuctionRoute.getLayout = (page) => (
  <div className="min-h-screen bg-white text-slate-900">
    <SiteHeader />
    {page}
  </div>
)

export default AuctionRoute
