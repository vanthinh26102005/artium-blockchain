import type { HostingEvent } from "@domains/events/state/useHostingEventsStore";

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
 * Form values for invite event form
 */
export type InviteEventFormValues = {
  recipientEmails: string[];
  personalMessage?: string;
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
