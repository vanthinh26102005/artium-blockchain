export type EventInvitationRecipientDto = {
  id?: string;
  email: string;
  name?: string;
};

export type SendEventInvitationsDto = {
  eventId: string;
  senderId?: string;
  senderName?: string;
  senderEmail?: string;
  recipients: EventInvitationRecipientDto[];
  message?: string;
  eventUrl?: string;
};
