// @shared - layout
import { MarketingLayout } from '@shared/components/layout/MarketingLayout'

// @shared - types
import type { NextPageWithLayout } from '@shared/types/next'

// @domains - discover
import { DiscoverPage } from '@domains/discover/views/DiscoverPage'

/**
 * DiscoverRoute - React component
 * @returns React element
 */
const DiscoverRoute: NextPageWithLayout = () => {
  // -- state --
  // -- derived --
  // -- handlers --
  // -- render --
  return <DiscoverPage />
}

DiscoverRoute.getLayout = (page) => <MarketingLayout>{page}</MarketingLayout>

export default DiscoverRoute
