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
  /** Identity Service - OTP sent during registration */
  USER_REGISTRATION_OTP = 'USER_REGISTRATION_OTP',
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

  // Blockchain Auction Events
  /** Auction started — notify followers/watchers */
  AUCTION_STARTED = 'AUCTION_STARTED',
  /** New bid placed — notify seller and previous highest bidder (outbid) */
  AUCTION_BID_PLACED = 'AUCTION_BID_PLACED',
  /** Auction ended — notify winner and seller */
  AUCTION_ENDED = 'AUCTION_ENDED',
  /** Artwork shipped by seller — notify buyer */
  AUCTION_SHIPPED = 'AUCTION_SHIPPED',
  /** Delivery confirmed by buyer — notify seller */
  AUCTION_DELIVERY_CONFIRMED = 'AUCTION_DELIVERY_CONFIRMED',
  /** Dispute opened by buyer — notify seller and arbiter */
  AUCTION_DISPUTE_OPENED = 'AUCTION_DISPUTE_OPENED',
  /** Dispute resolved by arbiter — notify buyer and seller */
  AUCTION_DISPUTE_RESOLVED = 'AUCTION_DISPUTE_RESOLVED',
  /** Auction cancelled — notify relevant parties */
  AUCTION_CANCELLED = 'AUCTION_CANCELLED',
  /** Shipping timeout — notify buyer (eligible for refund) */
  AUCTION_SHIPPING_TIMEOUT = 'AUCTION_SHIPPING_TIMEOUT',
  /** Delivery timeout — notify seller (eligible for payment) */
  AUCTION_DELIVERY_TIMEOUT = 'AUCTION_DELIVERY_TIMEOUT',
  /** Funds withdrawn from escrow contract — notify bidder */
  AUCTION_FUNDS_WITHDRAWN = 'AUCTION_FUNDS_WITHDRAWN',

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
