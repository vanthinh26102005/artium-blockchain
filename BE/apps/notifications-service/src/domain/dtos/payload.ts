export interface SendEmailEventPayload {
  historyId?: string;
  recipientEmail?: string;
  to?: string;
  title?: string;
  subject?: string;
  template: string;
  context?: Record<string, any>;
  body?: string;
  metadata?: Record<string, any>;
  retryInfo?: {
    isRequeued: boolean;
    requeueAttempt: number;
    requeuedAt: string;
  };
  userId?: string;
  triggerEvent?: string;
}
