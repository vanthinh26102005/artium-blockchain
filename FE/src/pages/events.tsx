// @shared - layout
import { SidebarLayout } from '@shared/components/layout/SidebarLayout'

// @shared - types
import type { NextPageWithLayout } from '@shared/types/next'

// @domains - events
import { EventsPage } from '@domains/events/views/EventsPage'

/**
 * EventsRoute - React component
 * @returns React element
 */
const EventsRoute: NextPageWithLayout = () => {
  return <EventsPage />
}

EventsRoute.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default EventsRoute
