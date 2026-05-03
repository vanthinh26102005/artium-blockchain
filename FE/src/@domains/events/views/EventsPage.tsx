// @shared - metadata
import { Metadata } from "@/components/SEO/Metadata";

// @domains - events
import { EventsHostingSection } from "@domains/events/components/sections/EventsHostingSection";
import { YourEventsSection } from "@domains/events/components/sections/YourEventsSection";
import { DiscoverEventsSection } from "@domains/events/components/sections/DiscoverEventsSection";

/**
 * EventsPage - React component
 * @returns React element
 */
export const EventsPage = () => {
  // -- render --
  return (
    <>
      <Metadata title="Events | Artium" />
      <div className="flex flex-col gap-8 py-8">
        <EventsHostingSection />
        <YourEventsSection />
        <DiscoverEventsSection />
      </div>
    </>
  );
};
