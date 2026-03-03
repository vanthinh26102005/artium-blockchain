import {
  NotificationHistory,
  NotificationStatus,
  NotificationChannel,
  NotificationTriggerEvent,
} from '../../domain';

// Replace with actual user IDs from identity service
const COLLECTOR_ID = 'a1b2c3d4-e5f6-7890-1234-567890abcdef'; // Placeholder

export const notificationsSeed: Partial<NotificationHistory>[] = [
  {
    userId: COLLECTOR_ID,
    channel: NotificationChannel.EMAIL,
    triggerEvent: NotificationTriggerEvent.USER_REGISTERED_WELCOME,
    status: NotificationStatus.SENT,
    title: 'Welcome to Artium!',
    body: 'Thank you for registering. We are excited to have you on board.',
    sentAt: new Date(),
  },
  {
    userId: COLLECTOR_ID,
    channel: NotificationChannel.IN_APP,
    triggerEvent: NotificationTriggerEvent.NEW_MESSAGE_RECEIVED,
    status: NotificationStatus.READ,
    title: 'New Artwork from Seller One',
    body: 'Seller One has just uploaded a new artwork. Check it out!',
    sentAt: new Date(),
    readAt: new Date(),
  },
];
