// @shared - layout
import { SidebarLayout } from '@shared/components/layout/SidebarLayout'

// @shared - types
import type { NextPageWithLayout } from '@shared/types/next'

// @domains - events
import { EventGuestsPage } from '@domains/events/views/EventGuestsPage'

/**
 * HomePageEventGuestsRoute - React component
 * @returns React element
 */
const HomePageEventGuestsRoute: NextPageWithLayout = () => {
  return <EventGuestsPage />
}

HomePageEventGuestsRoute.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default HomePageEventGuestsRoute
