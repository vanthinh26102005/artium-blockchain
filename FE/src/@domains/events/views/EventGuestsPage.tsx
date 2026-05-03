// react
import { useEffect, useMemo, useState } from "react";

// next
import Link from "next/link";
import { useRouter } from "next/router";

// @shared - metadata
import { Metadata } from "@/components/SEO/Metadata";

// @shared - components
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@shared/components/ui/breadcrumb";
import { cn } from "@shared/lib/utils";

// @domains - events
import { EventsPagination } from "@domains/events/components/ui/EventsPagination";
import { useHostingEventsStore, type HostingEvent } from "@domains/events/state/useHostingEventsStore";
import { useEventsStore } from "@domains/events/state/useEventsStore";
import { mockHomeEvents } from "@domains/home/mock/mockHomeEvents";
import { mockHostingEvents } from "@domains/events/mock/mockHostingEvents";
import { type Event } from "@domains/events/components/cards/EventCard";
import { useEventDetailStore } from "@domains/events/state/useEventDetailStore";
import eventsApis from "@shared/apis/eventsApis";
import { mapApiEventToHostingEvent } from "@domains/events/utils/eventMappers";

type GuestTab = "going" | "maybe" | "invited";

/**
 * TABS - React component
 * @returns React element
 */
const TABS: { key: GuestTab; label: string }[] = [
  { key: "going", label: "Going" },
  { key: "maybe", label: "Maybe" },
  { key: "invited", label: "Invited" },
];

const DEFAULT_PAGE_SIZE = 10;

const hashString = (input: string) => {
/**
 * DEFAULT_PAGE_SIZE - React component
 * @returns React element
 */
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
/**
 * hashString - Utility function
 * @returns void
 */
  return Math.abs(hash);
};

const normalizeEvent = (item: HostingEvent | Event): HostingEvent => {
  if ("locationType" in item) {
    return item as HostingEvent;
  }

  const base = item as Event;
  const inferredLocationType =
    base.location?.toLowerCase().includes("online") ? "online" : "in-person";
  return {
/**
 * normalizeEvent - Utility function
 * @returns void
 */
    id: base.id,
    title: base.title,
    location: base.location,
    locationType: inferredLocationType,
    address: base.location,
    venueDetails: undefined,
    onlineUrl: undefined,
    startDateTime: base.startDateTime,
/**
 * base - Utility function
 * @returns void
 */
    endDateTime: base.endDateTime,
    timeZone: base.timeZone,
    types: base.types,
    visibility: base.visibility,
/**
 * inferredLocationType - Utility function
 * @returns void
 */
    description: "",
    attendees: base.attendees,
    coverImageUrl: base.coverImageUrl,
    createdAt: base.startDateTime,
  };
};

const computeBaselineCounts = (event: HostingEvent) => {
  const baselineGoing =
    event.attendees > 0 ? Math.max(1, Math.round(event.attendees * 0.6)) : 8;
  const baselineMaybe =
    event.attendees > 0 ? Math.max(0, Math.round(event.attendees * 0.2)) : 3;
  return { baselineGoing, baselineMaybe };
};

const buildGuestLists = (
  eventId: string,
  invitedEmails: string[],
  counts: { going: number; maybe: number },
) => {
  const seed = hashString(eventId);
  const going = Array.from({ length: Math.max(0, counts.going) }, (_, idx) => `Guest ${seed + idx}`);
  const maybe = Array.from({ length: Math.max(0, counts.maybe) }, (_, idx) => `Guest ${seed + idx + 100}`);
  const invited = invitedEmails.length ? invitedEmails : [];

/**
 * computeBaselineCounts - Utility function
 * @returns void
 */
  return { going, maybe, invited };
};

export const EventGuestsPage = () => {
/**
 * baselineGoing - Utility function
 * @returns void
 */
  const router = useRouter();
  const eventId = router.query.id;
  const source = router.query.source as string | undefined;
  const tabParam = router.query.tab as GuestTab | undefined;
  const isHomePageContext = router.pathname.startsWith("/homepage");
/**
 * baselineMaybe - Utility function
 * @returns void
 */

  const hostingEvents = useHostingEventsStore((state) => state.events);
  const hostingLoaded = useHostingEventsStore((state) => state.hasLoaded);
  const hostingLoading = useHostingEventsStore((state) => state.isLoading);
  const loadHostingEvents = useHostingEventsStore((state) => state.loadEvents);
  const invitations = useHostingEventsStore((state) => state.invitations);
  const discoverEvents = useEventsStore((state) => state.allEvents);
  const discoverLoaded = useEventsStore((state) => state.hasLoaded);
/**
 * buildGuestLists - Utility function
 * @returns void
 */
  const discoverLoading = useEventsStore((state) => state.isLoading);
  const loadDiscoverEvents = useEventsStore((state) => state.loadDiscoverEvents);
  const guestStatsMap = useEventDetailStore((state) => state.guestStats);
  const initializeStats = useEventDetailStore((state) => state.initializeStats);
  const setInvitedCount = useEventDetailStore((state) => state.setInvitedCount);

  const [currentPageByTab, setCurrentPageByTab] = useState<Record<GuestTab, number>>({
    going: 1,
/**
 * seed - Utility function
 * @returns void
 */
    maybe: 1,
    invited: 1,
  });
  const [itemsPerPageByTab, setItemsPerPageByTab] = useState<Record<GuestTab, number>>({
/**
 * going - Utility function
 * @returns void
 */
    going: DEFAULT_PAGE_SIZE,
    maybe: DEFAULT_PAGE_SIZE,
    invited: DEFAULT_PAGE_SIZE,
  });
/**
 * maybe - Utility function
 * @returns void
 */
  const [fetchedEvent, setFetchedEvent] = useState<HostingEvent | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const event: HostingEvent | null = useMemo(() => {
/**
 * invited - Utility function
 * @returns void
 */
    const id = Array.isArray(eventId) ? eventId[0] : eventId;
    if (!id) return null;
    const found =
      mockHostingEvents.find((item) => item.id === id) ||
      hostingEvents.find((item) => item.id === id) ||
      discoverEvents.find((item) => item.id === id) ||
      mockHomeEvents.find((item) => item.id === id) ||
      fetchedEvent ||
/**
 * EventGuestsPage - React component
 * @returns React element
 */
      null;
    return found ? normalizeEvent(found) : null;
  }, [eventId, hostingEvents, discoverEvents, fetchedEvent]);

/**
 * router - Utility function
 * @returns void
 */
  const invitedEmails = useMemo(() => {
    if (!event) return [];
    return invitations
      .filter((inv) => inv.eventId === event.id)
/**
 * eventId - Utility function
 * @returns void
 */
      .map((inv) => inv.recipientEmail);
  }, [event, invitations]);

  const baseline = useMemo(() => (event ? computeBaselineCounts(event) : { baselineGoing: 0, baselineMaybe: 0 }), [event]);
/**
 * source - Utility function
 * @returns void
 */
  const guestStats = event ? guestStatsMap[event.id] : undefined;
  const goingCount = guestStats?.going ?? baseline.baselineGoing;
  const maybeCount = guestStats?.maybe ?? baseline.baselineMaybe;

/**
 * tabParam - Utility function
 * @returns void
 */
  useEffect(() => {
    if (!hostingLoaded) {
      void loadHostingEvents();
    }
/**
 * isHomePageContext - Utility function
 * @returns void
 */
    if (!discoverLoaded) {
      void loadDiscoverEvents();
    }
  }, [hostingLoaded, loadHostingEvents, discoverLoaded, loadDiscoverEvents]);

/**
 * hostingEvents - Utility function
 * @returns void
 */
  useEffect(() => {
    setFetchedEvent(null);
    setFetchError(null);
  }, [eventId]);
/**
 * hostingLoaded - Utility function
 * @returns void
 */

  useEffect(() => {
    const id = Array.isArray(eventId) ? eventId[0] : eventId;
    if (!id || fetchedEvent || fetchError) return;
/**
 * hostingLoading - Utility function
 * @returns void
 */
    if (hostingLoading || discoverLoading) return;
    if (event) return;

    const loadEvent = async () => {
/**
 * loadHostingEvents - Utility function
 * @returns void
 */
      try {
        const apiEvent = await eventsApis.getEventById(id);
        setFetchedEvent(mapApiEventToHostingEvent(apiEvent));
      } catch (error) {
/**
 * invitations - Utility function
 * @returns void
 */
        setFetchError(error instanceof Error ? error.message : "Event not found");
      }
    };

/**
 * discoverEvents - Utility function
 * @returns void
 */
    void loadEvent();
  }, [
    eventId,
    fetchedEvent,
/**
 * discoverLoaded - Utility function
 * @returns void
 */
    fetchError,
    hostingLoading,
    discoverLoading,
    event,
/**
 * discoverLoading - Utility function
 * @returns void
 */
  ]);

  useEffect(() => {
    if (!event) return;
/**
 * loadDiscoverEvents - Utility function
 * @returns void
 */
    const invitedCount = invitedEmails.length;
    initializeStats(event.id, {
      going: goingCount,
      maybe: maybeCount,
/**
 * guestStatsMap - Utility function
 * @returns void
 */
      invited: invitedCount,
      rsvpStatus: guestStats?.rsvpStatus ?? "rsvp",
    });
    setInvitedCount(event.id, invitedCount);
/**
 * initializeStats - Utility function
 * @returns void
 */
  }, [event, invitedEmails, initializeStats, setInvitedCount, goingCount, maybeCount, guestStats?.rsvpStatus]);

  const guestLists = useMemo(() => {
    if (!event) return { going: [], maybe: [], invited: [] };
/**
 * setInvitedCount - Utility function
 * @returns void
 */
    return buildGuestLists(event.id, invitedEmails, { going: goingCount, maybe: maybeCount });
  }, [event, invitedEmails, goingCount, maybeCount]);

  const activeTab: GuestTab = TABS.some((t) => t.key === tabParam) ? (tabParam as GuestTab) : "going";

  const activeList = guestLists[activeTab];
  const itemsPerPage = itemsPerPageByTab[activeTab];
  const currentPage = currentPageByTab[activeTab];
  const totalPages = Math.max(1, Math.ceil(activeList.length / itemsPerPage));
  const paginated = activeList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleTabChange = (next: GuestTab) => {
    const query = { ...router.query, tab: next };
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
    setCurrentPageByTab((prev) => ({ ...prev, [next]: 1 }));
  };

  if (!event && (hostingLoading || discoverLoading)) {
/**
 * event - Utility function
 * @returns void
 */
    return (
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 lg:px-0">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-base font-semibold text-slate-900">Loading guests...</p>
/**
 * id - Utility function
 * @returns void
 */
        </div>
      </div>
    );
  }

/**
 * found - Utility function
 * @returns void
 */
  if (!event && fetchError) {
    return (
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 lg:px-0">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-base font-semibold text-slate-900">{fetchError}</p>
          <Link
            href="/events"
            className="mt-3 inline-flex h-10 items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Back to events
          </Link>
        </div>
      </div>
/**
 * invitedEmails - Utility function
 * @returns void
 */
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 lg:px-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
/**
 * baseline - Utility function
 * @returns void
 */
                <Link href="/events">Events</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
/**
 * guestStats - Utility function
 * @returns void
 */
            <BreadcrumbItem>
              <BreadcrumbPage>Guests</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
/**
 * goingCount - Utility function
 * @returns void
 */
        </Breadcrumb>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-base font-semibold text-slate-900">Event not found</p>
          <Link
/**
 * maybeCount - Utility function
 * @returns void
 */
            href="/events"
            className="mt-3 inline-flex h-10 items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Back to events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Metadata title={`${event.title} Guests | Artium`} />
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 pb-10 pt-6 sm:px-6 lg:px-0">
        <Breadcrumb className="text-sm">
          <BreadcrumbList>
            {isHomePageContext ? (
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
/**
 * id - Utility function
 * @returns void
 */
                  className="text-slate-700 hover:text-slate-900"
                >
                  <Link href="/homepage">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            ) : source === "events" ? (
              <BreadcrumbItem>
                <BreadcrumbLink
/**
 * loadEvent - Utility function
 * @returns void
 */
                  asChild
                  className="text-slate-700 hover:text-slate-900"
                >
                  <Link href="/events">Events</Link>
                </BreadcrumbLink>
/**
 * apiEvent - Utility function
 * @returns void
 */
              </BreadcrumbItem>
            ) : event.id.startsWith("home-ev-") ? (
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  className="text-slate-700 hover:text-slate-900"
                >
                  <Link href="/homepage">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  className="text-slate-700 hover:text-slate-900"
                >
                  <Link href="/events">Events</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
/**
 * invitedCount - Utility function
 * @returns void
 */
              <BreadcrumbLink
                asChild
                className="text-slate-600 hover:text-slate-800"
              >
                <Link
                  href={{
                    pathname: isHomePageContext
                      ? `/homepage/events/${event.id}`
                      : `/events/${event.id}`,
                    query: source ? { source } : undefined,
                  }}
                >
                  {event.title}
/**
 * guestLists - Utility function
 * @returns void
 */
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-slate-900">
                Guests
              </BreadcrumbPage>
/**
 * activeTab - Utility function
 * @returns void
 */
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
/**
 * activeList - Utility function
 * @returns void
 */
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-slate-900">Guest</h1>

            <div className="flex flex-wrap items-center gap-2">
/**
 * itemsPerPage - Utility function
 * @returns void
 */
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
/**
 * currentPage - Utility function
 * @returns void
 */
                  onClick={() => handleTabChange(tab.key)}
                  className={cn(
                    "flex min-w-[110px] cursor-pointer items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-colors",
                    activeTab === tab.key
/**
 * totalPages - Utility function
 * @returns void
 */
                      ? "bg-slate-800 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
/**
 * paginated - Utility function
 * @returns void
 */
                  {tab.label} ({guestLists[tab.key].length})
                </button>
              ))}
            </div>

/**
 * handleTabChange - Utility function
 * @returns void
 */
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-1 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 sm:grid-cols-1 border-b border-slate-200">
                <div>Name</div>
              </div>
/**
 * query - Utility function
 * @returns void
 */
              {paginated.length > 0 ? (
                paginated.map((name, idx) => (
                  <div
                    key={`${name}-${idx}`}
                    className="border-t border-slate-200 px-4 py-3 text-sm text-slate-800"
                  >
                    {name}
                  </div>
                ))
              ) : (
                <div className="border-t border-slate-200 px-4 py-6 text-sm text-slate-600">
                  No guests yet for this tab.
                </div>
              )}
            </div>

            {activeList.length > 0 ? (
              <EventsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) =>
                  setCurrentPageByTab((prev) => ({ ...prev, [activeTab]: page }))
                }
                itemsPerPage={itemsPerPage}
                totalItems={activeList.length}
                onItemsPerPageChange={(value) => {
                  setItemsPerPageByTab((prev) => ({ ...prev, [activeTab]: value }));
                  setCurrentPageByTab((prev) => ({ ...prev, [activeTab]: 1 }));
                }}
                itemsPerPageOptions={[10, 20, 50]}
              />
            ) : null}
          </div>
        </section>
      </div>
    </>
  );
};
