// @shared - layout
import { SidebarLayout } from "@shared/components/layout/SidebarLayout";

// @shared - types
import type { NextPageWithLayout } from "@shared/types/next";

// @domains - events
import { EventDetailPage } from "@domains/events/views/EventDetailPage";

const EventDetailRoute: NextPageWithLayout = () => {
  return <EventDetailPage />;
};

EventDetailRoute.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>;

export default EventDetailRoute;
