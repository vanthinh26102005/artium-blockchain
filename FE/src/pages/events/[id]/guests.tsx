// @shared - layout
import { SidebarLayout } from "@shared/components/layout/SidebarLayout";

// @shared - types
import type { NextPageWithLayout } from "@shared/types/next";

// @domains - events
import { EventGuestsPage } from "@domains/events/views/EventGuestsPage";

/**
 * EventGuestsRoute - React component
 * @returns React element
 */
const EventGuestsRoute: NextPageWithLayout = () => {
  return <EventGuestsPage />;
};

EventGuestsRoute.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>;

export default EventGuestsRoute;
