// react
import { useMemo, useState, useRef, useEffect } from "react";

// next
import { useRouter } from "next/router";

// third-party
import { X } from "lucide-react";

// @shared
import { useDebounce } from "@shared/hooks/useDebounce";

// @domains - events
// @domains - events
import { EventFiltersBar } from "@domains/events/components/filters/EventFiltersBar";
import { EventCard, type EventStatus, type Event } from "@domains/events/components/cards/EventCard";
import { useEventsStore } from "@domains/events/state/useEventsStore";
import { InviteEventModal } from "@domains/events/modals/InviteEventModal";
import { ShareEventModal } from "@domains/events/modals/ShareEventModal";
import { EventsPagination } from "@domains/events/components/ui/EventsPagination";
import { ToastPortal } from "@domains/events/components/ui/ToastPortal";
import { type EventStatusValue } from "@domains/events/constants/eventFilterOptions";
import { type EventsHostingSortValue } from "@domains/events/constants/hostingSortOptions";
import { type HostingEvent } from "@domains/events/state/useHostingEventsStore";
import { mockHomeEvents } from "@domains/home/mock/mockHomeEvents";

const DEFAULT_STATUS_FILTER: EventStatusValue = "upcoming";
const DEFAULT_DATE_SORT: EventsHostingSortValue = "eventDateNewest";
const DEFAULT_ITEMS_PER_PAGE = 12;

export const YourEventsSection = () => {
  // -- refs --
  const sectionRef = useRef<HTMLElement>(null);
  const router = useRouter();

  // -- state --
  const [statusFilter, setStatusFilter] = useState<EventStatusValue>(DEFAULT_STATUS_FILTER);
  const [eventTypeFilter, setEventTypeFilter] = useState<string[]>([]);
  const [dateSortFilter, setDateSortFilter] = useState<EventsHostingSortValue>(DEFAULT_DATE_SORT);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteModalEvent, setInviteModalEvent] = useState<any | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareModalEvent, setShareModalEvent] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  // Use mock data for events (filtered by 'going' status to simulate 'Your Events')
  const events = useMemo(() => mockHomeEvents.filter((e: any) => e.rsvpStatus === 'going'), []);
  const isLoading = false; // Mock data is always loaded
  const updateRsvpStatus = useEventsStore((state) => state.updateRsvpStatus);

  // Track previous page to detect actual page changes (not initial mount)
  const prevPageRef = useRef(currentPage);
  useEffect(() => {
    // Only scroll if page actually changed (user clicked pagination)
    if (prevPageRef.current !== currentPage) {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      prevPageRef.current = currentPage;
    }
  }, [currentPage]);

  // -- derived --
  const filteredAndSortedEvents = useMemo(() => {
    const now = new Date();
    let filtered = [...events];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((event) => {
        const eventStart = new Date(event.startDateTime);
        const eventEnd = new Date(event.endDateTime);

        if (statusFilter === "upcoming") {
          return eventStart > now;
        } else if (statusFilter === "ongoing") {
          return eventStart <= now && eventEnd >= now;
        } else if (statusFilter === "past") {
          return eventEnd < now;
        }
        return true;
      });
    }

    // Filter by event type
    if (eventTypeFilter.length > 0) {
      filtered = filtered.filter((event) =>
        event.types.some((type) => eventTypeFilter.includes(type))
      );
    }

    // Filter by search query
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter((event) =>
        event.title.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query)
      );
    }

    // Sort by date and other criteria
    filtered.sort((a, b) => {
      const dateA = new Date(a.startDateTime).getTime();
      const dateB = new Date(b.startDateTime).getTime();

      switch (dateSortFilter) {
        case "eventDateNewest":
          return dateB - dateA;
        case "eventDateOldest":
          return dateA - dateB;
        case "titleAsc":
          return a.title.localeCompare(b.title, "en", { sensitivity: "base" });
        case "titleDesc":
          return b.title.localeCompare(a.title, "en", { sensitivity: "base" });
        default:
          return dateB - dateA;
      }
    });

    return filtered;
  }, [events, statusFilter, eventTypeFilter, debouncedSearchQuery, dateSortFilter]);

  const totalPages = Math.ceil(filteredAndSortedEvents.length / itemsPerPage);
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedEvents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedEvents, currentPage, itemsPerPage]);

  // -- handlers --
  const handleRsvpChange = (eventId: string, status: EventStatus) => {
    updateRsvpStatus(eventId, status);

    // Show success toast (simplified)
    setToast({
      message: "Your response updated!",
      variant: "success",
    });

    // Auto-hide toast after 3 seconds
    window.setTimeout(() => setToast(null), 3000);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const toHostingEvent = (event: Event): any => ({
    id: event.id,
    title: event.title,
    location: event.location,
    locationType: "in-person",
    address: event.location,
    venueDetails: undefined,
    onlineUrl: undefined,
    startDateTime: event.startDateTime,
    endDateTime: event.endDateTime,
    timeZone: event.timeZone,
    types: event.types,
    visibility: event.visibility,
    description: "",
    attendees: event.attendees,
    coverImageUrl: event.coverImageUrl,
    createdAt: event.startDateTime,
    rsvpStatus: event.rsvpStatus
  });

  // -- render --
  return (
    <section ref={sectionRef} className="rounded-3xl border border-slate-200 bg-white p-6 font-inter">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-inter text-2xl font-semibold leading-none text-slate-900">
            Your events
          </h2>
        </div>

        {/* Filters Row */}
        <EventFiltersBar
          statusFilter={statusFilter}
          onStatusChange={(value) => {
            setStatusFilter(value);
            handleFilterChange();
          }}
          eventTypeFilter={eventTypeFilter}
          onEventTypeChange={(value) => {
            setEventTypeFilter(value);
            handleFilterChange();
          }}
          dateSortFilter={dateSortFilter}
          onDateSortChange={(value) => {
            setDateSortFilter(value);
            handleFilterChange();
          }}
          searchQuery={searchQuery}
          onSearchChange={(e) => {
            setSearchQuery(e.target.value);
            handleFilterChange();
          }}
        />
      </div>

      {toast ? (
        <ToastPortal
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      ) : null}

      {/* Events Grid */}
      {isLoading && paginatedEvents.length === 0 ? (
        <div className="mt-6 flex min-h-[240px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-sm text-slate-600">
          Loading your events...
        </div>
      ) : paginatedEvents.length > 0 ? (
        <>
          <div className="mt-6 grid auto-rows-fr grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {paginatedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event as any}
                onRsvpChange={handleRsvpChange}
                onInvite={(event) => {
                  setInviteModalEvent(toHostingEvent(event));
                  setInviteModalOpen(true);
                }}
                onShare={(event) => {
                  setShareModalEvent(toHostingEvent(event));
                  setShareModalOpen(true);
                }}
                onClick={(id) => router.push(`/events/${id}?source=events`)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <EventsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItems={filteredAndSortedEvents.length}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          )}
        </>
      ) : (
        <div className="mt-6 flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            No events in your list yet
          </h3>
          <p className="max-w-[720px] text-sm text-slate-600">
            Events you RSVP to from the Discover section will appear here. Start exploring events below!
          </p>
        </div>
      )}

      {inviteModalEvent && (
        <InviteEventModal
          open={inviteModalOpen}
          onOpenChange={setInviteModalOpen}
          event={inviteModalEvent}
          onInviteSuccess={(recipientEmails) => {
            setToast({
              message: `Invitations sent to ${recipientEmails.length} ${recipientEmails.length === 1 ? "person" : "people"}`,
              variant: "success",
            });
            window.setTimeout(() => setToast(null), 3000);
          }}
        />
      )}

      {shareModalEvent && (
        <ShareEventModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          event={shareModalEvent}
        />
      )}
    </section>
  );
};
