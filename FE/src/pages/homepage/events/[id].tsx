// @shared - layout
import { SidebarLayout } from "@shared/components/layout/SidebarLayout";

// @shared - types
import type { NextPageWithLayout } from "@shared/types/next";

// @domains - events
import { EventDetailPage } from "@domains/events/views/EventDetailPage";

/**
 * HomePageEventDetailRoute - React component
 * @returns React element
 */
const HomePageEventDetailRoute: NextPageWithLayout = () => {
    return <EventDetailPage />;
};

HomePageEventDetailRoute.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>;

export default HomePageEventDetailRoute;
