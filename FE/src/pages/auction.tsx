import type { NextPageWithLayout } from '@shared/types/next'
import { SiteFooter } from '@shared/components/layout/SiteFooter'
import { SiteHeader } from '@shared/components/layout/SiteHeader'
import { LiveAuctionPage } from '@/views/LiveAuctionPage'

/**
 * AuctionRoute - React component
 * @returns React element
 */
const AuctionRoute: NextPageWithLayout = () => {
  return <LiveAuctionPage />
}

AuctionRoute.getLayout = (page) => (
  <div className="flex min-h-screen flex-col bg-white text-slate-900">
    <SiteHeader />
    <main className="flex-1">{page}</main>
    <SiteFooter />
  </div>
)

export default AuctionRoute
