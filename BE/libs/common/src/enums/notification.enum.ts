/**
 * Notification delivery channel
 * Used in: NotificationHistory.channel
 */
export enum NotificationChannel {
  /** Email notification */
  EMAIL = 'EMAIL',
  /** Mobile push notification */
  PUSH = 'PUSH',
  /** SMS text message */
  SMS = 'SMS',
  /** In-app notification (notification bell) */
  IN_APP = 'IN_APP',
  /** Webhook to external systems */
  WEBHOOK = 'WEBHOOK',
}

/**
 * Business event triggers for notifications
 * Used in: NotificationHistory.triggerEvent
 */
export enum NotificationTriggerEvent {
  /** Identity Service - User registered, send welcome email */
  USER_REGISTERED_WELCOME = 'USER_REGISTERED_WELCOME',
  /** Identity Service - Password reset requested */
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',

  /** Seller Profile Service - Profile approved by admin */
  SELLER_PROFILE_APPROVED = 'SELLER_PROFILE_APPROVED',

  /** Orders Service - Order created confirmation */
  ORDER_CREATED_CONFIRMATION = 'ORDER_CREATED_CONFIRMATION',
  /** Orders Service - Payment successful */
  ORDER_PAID_SUCCESS = 'ORDER_PAID_SUCCESS',
  /** Orders Service - Order shipped update */
  ORDER_SHIPPED_UPDATE = 'ORDER_SHIPPED_UPDATE',

  /** Invoicing Service - Invoice created */
  INVOICE_CREATED = 'INVOICE_CREATED',

  /** Events Service - Event reminder 24 hours before */
  EVENT_REMINDER_24H = 'EVENT_REMINDER_24H',
  /** Events Service - RSVP confirmed */
  RSVP_CONFIRMED = 'RSVP_CONFIRMED',

  /** Messaging Service - New message received */
  NEW_MESSAGE_RECEIVED = 'NEW_MESSAGE_RECEIVED',

  /** Marketing Service - Marketing campaign email */
  MARKETING_CAMPAIGN_EMAIL = 'MARKETING_CAMPAIGN_EMAIL',

  /** Generic alert notification */
  GENERIC_ALERT = 'GENERIC_ALERT',
}

/**
 * Notification delivery status
 * Used in: NotificationHistory.status
 */
export enum NotificationStatus {
  /** Waiting in queue to be sent */
  PENDING = 'PENDING',
  /** Successfully sent from service */
  SENT = 'SENT',
  /** Provider confirmed delivery (SendGrid, FCM, etc.) */
  DELIVERED = 'DELIVERED',
  /** User has read the notification */
  READ = 'READ',
  /** Failed to send */
  FAILED = 'FAILED',
}
