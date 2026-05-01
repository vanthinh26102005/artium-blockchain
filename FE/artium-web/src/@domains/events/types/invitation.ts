import type { HostingEvent } from "@domains/events/state/useHostingEventsStore";

export type { InviteEventFormValues } from "@domains/events/validations/eventForm.schema";

/**
 * Invitation status lifecycle
 */
export type InvitationStatus = "sent" | "opened" | "accepted" | "declined";

/**
 * Event invitation record
 */
export type EventInvitation = {
  id: string;
  eventId: string;
  recipientEmail: string;
  status: InvitationStatus;
  sentAt: string; // ISO string
  openedAt?: string;
  respondedAt?: string;
};

/**
 * Email template data structure for rendering
 */
export type EmailTemplateData = {
  event: HostingEvent;
  host: {
    fullName: string;
    username: string;
    avatarUrl: string;
  };
  recipients: Array<{
    email: string;
    fullName?: string;
  }>;
};
