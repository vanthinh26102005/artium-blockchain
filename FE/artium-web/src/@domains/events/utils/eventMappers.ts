import type { Event } from "@domains/events/components/cards/EventCard";
import type { HostingEvent } from "@domains/events/state/useHostingEventsStore";
import type { CreateEventFormValues } from "@domains/events/forms/CreateEventForm";
import type {
  CreateEventRequest,
  EventApiResponse,
  EventLocation,
} from "@shared/apis/eventsApis";

const EVENT_TYPE_MAP: Record<string, string> = {
  EXHIBITION: "exhibition",
  ART_FAIR: "art-fair",
  GALLERY_OPENING: "gallery-opening",
  WORKSHOP: "workshop",
  ARTIST_TALK: "panel-talk",
  PRIVATE_VIEW: "studio-visit",
  ONLINE_EVENT: "other",
  OTHER: "other",
};

const resolveTypes = (event: EventApiResponse): string[] => {
  if (event.tags && event.tags.length) {
    return event.tags;
  }
  const mapped = EVENT_TYPE_MAP[event.type] ?? "other";
  return [mapped];
};

const buildAddressLine = (location?: EventLocation | null): string | undefined => {
  if (!location?.address) {
    return undefined;
  }
  const parts = [
    location.address.line1,
    location.address.line2,
    location.address.city,
    location.address.state,
    location.address.postalCode,
    location.address.country,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : undefined;
};

export const mapEventLocation = (location?: EventLocation | null) => {
  if (!location) {
    return {
      locationType: "in-person" as const,
      address: "",
      venueDetails: "",
      onlineUrl: "",
      locationLabel: "Event location",
    };
  }

  if (location.type === "VIRTUAL") {
    return {
      locationType: "online" as const,
      address: "",
      venueDetails: "",
      onlineUrl: location.virtualUrl ?? "",
      locationLabel: "Online event",
    };
  }

  const addressLine = buildAddressLine(location) ?? "";
  const venue = location.venueName ?? "";
  const locationLabel = [venue, addressLine].filter(Boolean).join(" - ") || "In-person event";

  return {
    locationType: "in-person" as const,
    address: addressLine,
    venueDetails: venue,
    onlineUrl: "",
    locationLabel,
  };
};

export const mapApiEventToHostingEvent = (event: EventApiResponse): HostingEvent => {
  const locationInfo = mapEventLocation(event.location);
  const createdAt = event.createdAt || event.startTime || new Date().toISOString();
  const startDateTime = event.startTime || new Date().toISOString();
  const endDateTime =
    event.endTime ||
    new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString();

  return {
    id: event.id,
    title: event.title,
    location: locationInfo.locationLabel,
    locationType: locationInfo.locationType,
    address: locationInfo.address || undefined,
    venueDetails: locationInfo.venueDetails || undefined,
    onlineUrl: locationInfo.onlineUrl || undefined,
    startDateTime,
    endDateTime,
    timeZone: event.timezone ?? undefined,
    types: resolveTypes(event),
    visibility: event.isPublic === false ? "private" : "public",
    description: event.description ?? "",
    attendees: event.attendeeCount ?? 0,
    coverImageUrl: event.coverImageUrl ?? undefined,
    createdAt,
  };
};

export const mapApiEventToEvent = (
  event: EventApiResponse,
  overrides?: Partial<Event>,
): Event => {
  const hosting = mapApiEventToHostingEvent(event);
  return {
    id: hosting.id,
    title: hosting.title,
    location: hosting.location,
    startDateTime: hosting.startDateTime,
    endDateTime: hosting.endDateTime,
    timeZone: hosting.timeZone,
    types: hosting.types,
    visibility: hosting.visibility,
    attendees: hosting.attendees,
    coverImageUrl: hosting.coverImageUrl,
    rsvpStatus: "rsvp",
    ...overrides,
  };
};

export const buildCreateEventPayload = (
  values: CreateEventFormValues,
  coverImageUrl?: string | null,
): CreateEventRequest => ({
  title: values.title,
  description: values.description,
  startDateTime: values.startDateTime,
  endDateTime: values.endDateTime,
  timeZone: values.timeZone,
  locationType: values.locationType,
  address: values.address,
  venueDetails: values.venueDetails,
  onlineUrl: values.onlineUrl,
  visibility: values.visibility,
  types: values.types,
  coverImageUrl: coverImageUrl ?? undefined,
});
