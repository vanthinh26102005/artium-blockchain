// third-party
import { create } from "zustand";

// @domains - events
import { type CreateEventFormValues } from "@domains/events/forms/CreateEventForm";
import {
  eventImages,
  type HostingEvent,
} from "@domains/events/mock/mockHostingEvents";
import { type EventInvitation } from "@domains/events/types/invitation";
import artworkUploadApi from "@shared/apis/artworkUploadApi";
import eventsApis, {
  type EventApiResponse,
} from "@shared/apis/eventsApis";
import {
  buildCreateEventPayload,
  mapApiEventToHostingEvent,
} from "@domains/events/utils/eventMappers";
import { useAuthStore } from "@domains/auth/stores/useAuthStore";

type HostingEventsState = {
  events: HostingEvent[];
  invitations: EventInvitation[];
  isLoading: boolean;
  hasLoaded: boolean;
  error?: string | null;
  loadEvents: () => Promise<void>;
  addEvent: (values: CreateEventFormValues) => Promise<HostingEvent>;
  deleteEvent: (id: string) => Promise<void>;
  updateEvent: (event: HostingEvent) => void;
  updateEventFromForm: (
    id: string,
    values: CreateEventFormValues,
  ) => Promise<HostingEvent | undefined>;
  copyLink: (eventId: string) => Promise<void>;
  sendInvitations: (
    eventId: string,
    recipientEmails: string[],
    message?: string,
  ) => Promise<void>;
  getInvitationsForEvent: (eventId: string) => EventInvitation[];
};

const makeGradientFromTitle = (title: string) => {
  const hash = [...title].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return (
    eventImages[hash % eventImages.length] ??
    eventImages[0] ??
    "data:image/svg+xml;charset=UTF-8,"
  );
};

const ensureCoverImage = (event: HostingEvent) => {
  if (event.coverImageUrl) return event;
  return { ...event, coverImageUrl: makeGradientFromTitle(event.title) };
};

const mapApiToHostingEvent = (event: EventApiResponse): HostingEvent => {
  return ensureCoverImage(mapApiEventToHostingEvent(event));
};

const createLocalId = () => {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const resolveUploadedImageUrl = (result: { secureUrl?: string; url?: string }) => {
  return result.secureUrl || result.url;
};

const uploadEventCoverImage = async (file: File, eventId: string, title: string) => {
  const { user } = useAuthStore.getState();
  const uploadResult = await artworkUploadApi.uploadArtworkImage({
    file,
    sellerId: user?.id ?? "event-host",
    artworkId: `event-${eventId}`,
    altText: title,
    isPrimary: true,
  });
  const coverImageUrl = resolveUploadedImageUrl(uploadResult);

  if (!coverImageUrl) {
    throw new Error("Event cover upload did not return an image URL.");
  }

  return coverImageUrl;
};

export const useHostingEventsStore = create<HostingEventsState>((set, get) => ({
  events: [],
  invitations: [],
  isLoading: false,
  hasLoaded: false,
  error: null,
  loadEvents: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const events = await eventsApis.getHostingEvents();
      set({
        events: events.map(mapApiToHostingEvent),
        isLoading: false,
        hasLoaded: true,
      });
    } catch (error) {
      set({
        isLoading: false,
        hasLoaded: true,
        error: error instanceof Error ? error.message : "Failed to load events",
      });
    }
  },
  addEvent: async (values) => {
    const eventUploadId = createLocalId();
    const coverImageUrl = values.coverImage
      ? await uploadEventCoverImage(values.coverImage, eventUploadId, values.title)
      : undefined;
    const payload = buildCreateEventPayload(values, coverImageUrl);
    const created = await eventsApis.createEvent(payload);
    const event = mapApiToHostingEvent(created);
    set((state) => ({ events: [event, ...state.events] }));
    return event;
  },
  deleteEvent: async (id) => {
    await eventsApis.deleteEvent(id);
    set((state) => ({
      events: state.events.filter((event) => event.id !== id),
    }));
  },
  updateEvent: (next) => {
    set((state) => ({
      events: state.events.map((event) =>
        event.id === next.id ? next : event,
      ),
    }));
  },
  updateEventFromForm: async (id, values) => {
    const existing = get().events.find((event) => event.id === id);
    const coverImageUrl = values.coverImage
      ? await uploadEventCoverImage(values.coverImage, id, values.title)
      : existing?.coverImageUrl ?? null;
    const payload = buildCreateEventPayload(values, coverImageUrl);
    const updatedApi = await eventsApis.updateEvent(id, payload);
    const updated = mapApiToHostingEvent(updatedApi);
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id ? updated : event,
      ),
    }));
    return updated;
  },
  copyLink: async (eventId: string) => {
    if (typeof window === "undefined" || !navigator?.clipboard) {
      return;
    }
    const origin = window.location.origin && window.location.origin !== "null"
      ? window.location.origin
      : "";
    const urlToCopy = origin ? `${origin}/event/${eventId}` : window.location.href;
    await navigator.clipboard.writeText(urlToCopy);
  },
  sendInvitations: async (eventId, recipientEmails, message) => {
    const recipients = recipientEmails.map((email) => ({ email }));
    const { user } = useAuthStore.getState();

    await eventsApis.sendInvitations(eventId, {
      recipients,
      message,
      senderName: user?.displayName ?? user?.username ?? undefined,
      senderEmail: user?.email ?? undefined,
    });

    const invitations: EventInvitation[] = recipients.map((recipient) => ({
      id: `inv-${crypto.randomUUID?.() ?? Date.now()}-${recipient.email}`,
      eventId,
      recipientEmail: recipient.email,
      status: "sent",
      sentAt: new Date().toISOString(),
    }));

    set((state) => ({
      invitations: [...state.invitations, ...invitations],
    }));
  },
  getInvitationsForEvent: (eventId) =>
    get().invitations.filter((invitation) => invitation.eventId === eventId),
}));

export type { HostingEvent };
