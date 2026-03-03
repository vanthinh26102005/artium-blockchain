# Notifications Service Entities

This document describes all entities in the notifications-service and their relationships.

## Entities Overview

### 1. NotificationHistory
**Purpose:** Track all notifications sent to users across all channels

**Fields:**
- `id` (PK) - Unique identifier
- `userId` - Reference to identity-service User (recipient)
- **Delivery:**
  - `channel` - Delivery channel (EMAIL, PUSH, SMS, IN_APP, WEBHOOK)
  - `triggerEvent` - Business event that triggered notification
  - `status` - Notification status (PENDING, SENT, DELIVERED, READ, FAILED)
- **Content:**
  - `title` - Notification title (email subject, push title, etc.)
  - `body` - Notification body content
  - `templateContext` - Template rendering context data (JSONB)
  - `metadata` - Additional metadata (JSONB)
    - Provider IDs (SendGrid message ID, FCM token, etc.)
    - Related entity IDs
    - Custom tracking data
- **Error Tracking:**
  - `failureReason` - Human-readable failure reason
- **Timestamps:**
  - `sentAt` - When notification was sent
  - `readAt` - When user read notification (IN_APP, EMAIL tracking)
  - `createdAt` - When notification was queued
  - `updatedAt` - Last status update

**Relationships:**
- **→ User** (Cross-service): Via `userId` UUID reference

**Indexes:**
- Composite: `(userId, createdAt)` - User notification history
- Composite: `(triggerEvent, status)` - Analytics queries
- Single: `status` - Process pending notifications

**Notification Channels:**
- EMAIL - Email notifications via SendGrid/SES
- PUSH - Mobile push notifications via FCM/APNS
- SMS - SMS notifications via Twilio
- IN_APP - In-app notification center
- WEBHOOK - Send to third-party systems

**Notification Statuses:**
- PENDING - Queued, waiting to be sent
- SENT - Successfully sent from service
- DELIVERED - Provider confirmed delivery (email opened, push delivered)
- READ - User read the notification
- FAILED - Delivery failed

**Trigger Events:**

**Identity & Auth:**
- USER_REGISTERED_WELCOME - Welcome email for new users
- PASSWORD_RESET_REQUESTED - Password reset link
- SELLER_PROFILE_APPROVED - Seller profile approved

**Orders & Payments:**
- ORDER_CREATED_CONFIRMATION - Order confirmation
- ORDER_PAID_SUCCESS - Payment successful
- ORDER_SHIPPED_UPDATE - Shipment tracking
- INVOICE_CREATED - Invoice sent to customer

**Events:**
- EVENT_REMINDER_24H - Event reminder 24 hours before
- RSVP_CONFIRMED - RSVP confirmation

**Messaging:**
- NEW_MESSAGE_RECEIVED - New direct message

**Marketing:**
- MARKETING_CAMPAIGN_EMAIL - Marketing campaign

**General:**
- GENERIC_ALERT - Generic notification

---

## Cross-Service References

**This service references:**

| External Service | Entity | Field | Purpose |
|------------------|--------|-------|---------|
| identity-service | User | `userId` | Notification recipient |

**This service is referenced by:**
- No external services currently reference notification entities

---

## Notification Flows

### 1. Order Confirmation Email

```typescript
// Triggered by orders-service after order creation
// Step 1: orders-service publishes event
await eventBus.publish('order.created', {
  orderId: order.id,
  userId: order.buyerId,
  orderNumber: order.orderNumber,
  totalAmount: order.totalAmount,
  items: order.items
});

// Step 2: notifications-service listens to event
@EventPattern('order.created')
async handleOrderCreated(payload) {
  // Step 3: Get user email from identity-service
  const user = await identityClient.getUserById(payload.userId);

  // Step 4: Create notification record
  const notification = await createNotification({
    userId: payload.userId,
    channel: NotificationChannel.EMAIL,
    triggerEvent: NotificationTriggerEvent.ORDER_CREATED_CONFIRMATION,
    status: NotificationStatus.PENDING,
    title: `Order Confirmation - ${payload.orderNumber}`,
    body: 'Your order has been confirmed!',
    templateContext: {
      orderNumber: payload.orderNumber,
      orderDate: new Date(),
      totalAmount: payload.totalAmount,
      items: payload.items,
      shippingAddress: payload.shippingAddress
    },
    metadata: {
      orderId: payload.orderId,
      orderNumber: payload.orderNumber
    }
  });

  // Step 5: Send email via SendGrid
  const result = await sendGridClient.send({
    to: user.email,
    templateId: 'd-order-confirmation-template',
    dynamicTemplateData: notification.templateContext
  });

  // Step 6: Update notification status
  notification.status = NotificationStatus.SENT;
  notification.sentAt = new Date();
  notification.metadata.sendGridMessageId = result.messageId;

  await notificationRepository.save(notification);
}
```

### 2. Push Notification (New Message)

```typescript
// Triggered by messaging-service when new message sent
// Step 1: messaging-service publishes event
await eventBus.publish('message.sent', {
  messageId: message.id,
  conversationId: message.conversationId,
  senderId: message.senderId,
  recipientId: recipient.id,
  content: message.content
});

// Step 2: notifications-service handles event
@EventPattern('message.sent')
async handleMessageSent(payload) {
  // Step 3: Get recipient push tokens
  const user = await identityClient.getUserById(payload.recipientId);
  const pushTokens = user.pushTokens || [];

  if (pushTokens.length === 0) {
    return; // User has no push tokens
  }

  // Step 4: Get sender details
  const sender = await identityClient.getUserById(payload.senderId);

  // Step 5: Create notification record
  const notification = await createNotification({
    userId: payload.recipientId,
    channel: NotificationChannel.PUSH,
    triggerEvent: NotificationTriggerEvent.NEW_MESSAGE_RECEIVED,
    status: NotificationStatus.PENDING,
    title: sender.name,
    body: payload.content,
    templateContext: {
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatarUrl,
      conversationId: payload.conversationId,
      messagePreview: payload.content.substring(0, 100)
    },
    metadata: {
      messageId: payload.messageId,
      conversationId: payload.conversationId
    }
  });

  // Step 6: Send push via FCM
  const results = await fcmClient.sendMulticast({
    tokens: pushTokens,
    notification: {
      title: notification.title,
      body: notification.body
    },
    data: {
      type: 'NEW_MESSAGE',
      conversationId: payload.conversationId,
      messageId: payload.messageId
    }
  });

  // Step 7: Update status
  notification.status = NotificationStatus.SENT;
  notification.sentAt = new Date();
  notification.metadata.fcmMessageId = results.responses[0]?.messageId;

  await notificationRepository.save(notification);
}
```

### 3. In-App Notification

```typescript
// Step 1: Create in-app notification
const notification = await createNotification({
  userId: targetUserId,
  channel: NotificationChannel.IN_APP,
  triggerEvent: NotificationTriggerEvent.SELLER_PROFILE_APPROVED,
  status: NotificationStatus.SENT, // In-app is immediately "sent"
  title: 'Seller Profile Approved!',
  body: 'Congratulations! Your seller profile has been approved.',
  sentAt: new Date(),
  metadata: {
    profileId: sellerProfile.id,
    actionUrl: '/seller/dashboard'
  }
});

// Step 2: Send real-time notification via WebSocket
io.to(`user:${targetUserId}`).emit('notification', {
  id: notification.id,
  title: notification.title,
  body: notification.body,
  createdAt: notification.createdAt,
  metadata: notification.metadata
});

// Step 3: User opens notification center
// Frontend fetches unread notifications
const unreadNotifications = await getUnreadNotifications(userId);

// Step 4: User clicks notification
await markNotificationAsRead(notificationId);

notification.status = NotificationStatus.READ;
notification.readAt = new Date();
```

### 4. Event Reminder (Scheduled)

```typescript
// Cron job runs every hour to check upcoming events
@Cron('0 * * * *') // Every hour
async sendEventReminders() {
  // Step 1: Get events starting in 24 hours
  const upcomingEvents = await eventsClient.getEventsStartingIn(24 * 60 * 60 * 1000);

  for (const event of upcomingEvents) {
    // Step 2: Get all RSVP'd attendees
    const rsvps = await eventsClient.getEventRsvps(event.eventId);

    for (const rsvp of rsvps) {
      // Step 3: Check if reminder already sent
      const existingNotification = await findNotification({
        userId: rsvp.userId,
        triggerEvent: NotificationTriggerEvent.EVENT_REMINDER_24H,
        'metadata.eventId': event.eventId
      });

      if (existingNotification) {
        continue; // Already sent
      }

      // Step 4: Get user preferences
      const user = await identityClient.getUserById(rsvp.userId);
      const preferredChannel = user.notificationPreferences?.eventReminders || NotificationChannel.EMAIL;

      // Step 5: Create notification
      const notification = await createNotification({
        userId: rsvp.userId,
        channel: preferredChannel,
        triggerEvent: NotificationTriggerEvent.EVENT_REMINDER_24H,
        status: NotificationStatus.PENDING,
        title: `Event Reminder: ${event.title}`,
        body: `Your event "${event.title}" starts tomorrow at ${formatTime(event.startTime)}`,
        templateContext: {
          eventTitle: event.title,
          eventDate: event.startTime,
          eventLocation: event.location,
          eventUrl: `https://app.com/events/${event.eventId}`
        },
        metadata: {
          eventId: event.eventId,
          rsvpId: rsvp.id
        }
      });

      // Step 6: Send via appropriate channel
      await sendNotification(notification);
    }
  }
}
```

### 5. Email Marketing Campaign

```typescript
// Triggered by crm-service when campaign is sent
// Step 1: crm-service publishes batch event
await eventBus.publish('campaign.send', {
  campaignId: campaign.id,
  sellerId: campaign.sellerId,
  recipientContactIds: campaign.recipientContactIds,
  subject: campaign.subject,
  content: campaign.content
});

// Step 2: notifications-service processes batch
@EventPattern('campaign.send')
async handleCampaignSend(payload) {
  for (const contactId of payload.recipientContactIds) {
    // Step 3: Get contact details
    const contact = await crmClient.getContact(contactId);

    if (!contact.optInEmail || contact.status === 'UNSUBSCRIBED') {
      continue; // Skip unsubscribed
    }

    // Step 4: Create notification
    const notification = await createNotification({
      userId: contact.userId || null, // May not have userId
      channel: NotificationChannel.EMAIL,
      triggerEvent: NotificationTriggerEvent.MARKETING_CAMPAIGN_EMAIL,
      status: NotificationStatus.PENDING,
      title: payload.subject,
      body: payload.content,
      templateContext: {
        contactName: contact.firstName,
        sellerName: payload.sellerName,
        content: payload.content
      },
      metadata: {
        campaignId: payload.campaignId,
        contactId: contact.id,
        sellerId: payload.sellerId,
        unsubscribeToken: generateUnsubscribeToken(contact.id)
      }
    });

    // Step 5: Send via SendGrid
    await sendGridClient.send({
      to: contact.email,
      subject: notification.title,
      html: renderTemplate('campaign-email', notification.templateContext),
      customArgs: {
        campaignId: payload.campaignId,
        contactId: contact.id
      },
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true }
      }
    });

    // Step 6: Update status
    notification.status = NotificationStatus.SENT;
    notification.sentAt = new Date();
  }
}

// Step 7: Handle SendGrid webhook for opens/clicks
@Post('/webhooks/sendgrid')
async handleSendGridWebhook(events) {
  for (const event of events) {
    const notification = await findBySendGridMessageId(event.sg_message_id);

    if (!notification) continue;

    switch (event.event) {
      case 'delivered':
        notification.status = NotificationStatus.DELIVERED;
        break;
      case 'open':
        notification.status = NotificationStatus.READ;
        notification.readAt = new Date(event.timestamp * 1000);
        // Update CRM contact engagement
        await crmClient.trackEmailOpen(event.customArgs.contactId);
        break;
      case 'click':
        await crmClient.trackEmailClick(event.customArgs.contactId);
        break;
      case 'bounce':
      case 'dropped':
        notification.status = NotificationStatus.FAILED;
        notification.failureReason = event.reason;
        await crmClient.markContactAsBounced(event.customArgs.contactId);
        break;
    }

    await notificationRepository.save(notification);
  }
}
```

### 6. SMS Notification (Order Shipped)

```typescript
// Triggered by orders-service when shipment created
@EventPattern('order.shipped')
async handleOrderShipped(payload) {
  // Step 1: Get user phone number
  const user = await identityClient.getUserById(payload.userId);

  if (!user.phone || !user.phoneVerified) {
    return; // No verified phone
  }

  // Step 2: Create notification
  const notification = await createNotification({
    userId: payload.userId,
    channel: NotificationChannel.SMS,
    triggerEvent: NotificationTriggerEvent.ORDER_SHIPPED_UPDATE,
    status: NotificationStatus.PENDING,
    title: 'Order Shipped',
    body: `Your order ${payload.orderNumber} has shipped! Track: ${payload.trackingUrl}`,
    templateContext: {
      orderNumber: payload.orderNumber,
      trackingNumber: payload.trackingNumber,
      trackingUrl: payload.trackingUrl,
      estimatedDelivery: payload.estimatedDelivery
    },
    metadata: {
      orderId: payload.orderId,
      shipmentId: payload.shipmentId
    }
  });

  // Step 3: Send via Twilio
  const result = await twilioClient.messages.create({
    to: user.phone,
    body: notification.body
  });

  // Step 4: Update status
  notification.status = NotificationStatus.SENT;
  notification.sentAt = new Date();
  notification.metadata.twilioMessageSid = result.sid;

  await notificationRepository.save(notification);
}
```

---

## Notification Preferences

### User Notification Settings

```typescript
// Stored in identity-service User entity
interface NotificationPreferences {
  email: {
    orderUpdates: boolean;
    eventReminders: boolean;
    newMessages: boolean;
    marketing: boolean;
  };
  push: {
    orderUpdates: boolean;
    eventReminders: boolean;
    newMessages: boolean;
    marketing: boolean;
  };
  sms: {
    orderUpdates: boolean;
    eventReminders: boolean;
  };
  inApp: {
    all: boolean;
  };
}

// Before sending notification, check preferences
async function shouldSendNotification(
  userId: string,
  channel: NotificationChannel,
  triggerEvent: NotificationTriggerEvent
): Promise<boolean> {
  const user = await identityClient.getUserById(userId);
  const prefs = user.notificationPreferences;

  // Map trigger event to preference category
  const category = mapTriggerEventToCategory(triggerEvent);

  return prefs[channel.toLowerCase()]?.[category] !== false;
}
```

---

## Provider Integrations

### SendGrid (Email)

```typescript
class SendGridProvider {
  async send(notification: NotificationHistory) {
    const result = await this.client.send({
      to: notification.recipient.email,
      from: 'noreply@artworkapp.com',
      subject: notification.title,
      html: renderTemplate(notification.triggerEvent, notification.templateContext),
      customArgs: {
        notificationId: notification.id,
        userId: notification.userId
      },
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true }
      }
    });

    return {
      status: NotificationStatus.SENT,
      metadata: {
        sendGridMessageId: result.messageId
      }
    };
  }
}
```

### Firebase Cloud Messaging (Push)

```typescript
class FCMProvider {
  async send(notification: NotificationHistory) {
    const user = await identityClient.getUserById(notification.userId);
    const tokens = user.pushTokens || [];

    if (tokens.length === 0) {
      throw new Error('No push tokens available');
    }

    const result = await this.fcm.sendMulticast({
      tokens,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.metadata,
      apns: {
        payload: {
          aps: {
            badge: await getUnreadNotificationCount(notification.userId),
            sound: 'default'
          }
        }
      }
    });

    return {
      status: NotificationStatus.SENT,
      metadata: {
        fcmMessageId: result.responses[0]?.messageId,
        successCount: result.successCount,
        failureCount: result.failureCount
      }
    };
  }
}
```

### Twilio (SMS)

```typescript
class TwilioProvider {
  async send(notification: NotificationHistory) {
    const user = await identityClient.getUserById(notification.userId);

    if (!user.phone || !user.phoneVerified) {
      throw new Error('No verified phone number');
    }

    const result = await this.client.messages.create({
      to: user.phone,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: notification.body
    });

    return {
      status: NotificationStatus.SENT,
      metadata: {
        twilioMessageSid: result.sid,
        twilioStatus: result.status
      }
    };
  }
}
```

---

## Analytics & Reporting

### Notification Metrics

```typescript
const analytics = {
  overall: {
    total: await getNotificationCount(),
    byChannel: await getCountByChannel(),
    byStatus: await getCountByStatus(),
    byTriggerEvent: await getCountByTriggerEvent()
  },
  deliveryRates: {
    email: {
      sent: await getCountByChannel(NotificationChannel.EMAIL, NotificationStatus.SENT),
      delivered: await getCountByChannel(NotificationChannel.EMAIL, NotificationStatus.DELIVERED),
      read: await getCountByChannel(NotificationChannel.EMAIL, NotificationStatus.READ),
      failed: await getCountByChannel(NotificationChannel.EMAIL, NotificationStatus.FAILED),
      deliveryRate: (delivered / sent) * 100,
      openRate: (read / delivered) * 100
    },
    push: {
      sent: await getCountByChannel(NotificationChannel.PUSH, NotificationStatus.SENT),
      delivered: await getCountByChannel(NotificationChannel.PUSH, NotificationStatus.DELIVERED),
      deliveryRate: (delivered / sent) * 100
    },
    sms: {
      sent: await getCountByChannel(NotificationChannel.SMS, NotificationStatus.SENT),
      failed: await getCountByChannel(NotificationChannel.SMS, NotificationStatus.FAILED),
      successRate: ((sent - failed) / sent) * 100
    }
  },
  engagement: {
    avgTimeToRead: await getAvgTimeToRead(),
    readRateByTriggerEvent: await getReadRateByTriggerEvent(),
    clickThroughRate: await getClickThroughRate()
  }
};
```

### User Engagement Tracking

```typescript
// Track which notifications users engage with most
const userEngagement = await getUserNotificationEngagement(userId);

// Results:
{
  userId: 'uuid',
  totalReceived: 145,
  totalRead: 98,
  readRate: 67.6,
  preferredChannel: NotificationChannel.PUSH,
  engagementByType: {
    ORDER_CREATED_CONFIRMATION: { received: 5, read: 5, readRate: 100 },
    NEW_MESSAGE_RECEIVED: { received: 87, read: 75, readRate: 86.2 },
    MARKETING_CAMPAIGN_EMAIL: { received: 12, read: 2, readRate: 16.7 }
  },
  avgTimeToRead: 3600 // seconds
}
```

---

## Queue Processing

### Notification Queue Worker

```typescript
// Process pending notifications in batches
@Cron('*/30 * * * * *') // Every 30 seconds
async processPendingNotifications() {
  const pending = await notificationRepository.find({
    where: { status: NotificationStatus.PENDING },
    take: 100,
    order: { createdAt: 'ASC' }
  });

  for (const notification of pending) {
    try {
      // Select provider based on channel
      const provider = this.getProvider(notification.channel);

      // Send notification
      const result = await provider.send(notification);

      // Update status
      notification.status = result.status;
      notification.sentAt = new Date();
      notification.metadata = {
        ...notification.metadata,
        ...result.metadata
      };

      await notificationRepository.save(notification);
    } catch (error) {
      // Mark as failed
      notification.status = NotificationStatus.FAILED;
      notification.failureReason = error.message;

      await notificationRepository.save(notification);

      // Log error
      logger.error('Failed to send notification', {
        notificationId: notification.id,
        error: error.message
      });
    }
  }
}
```

### Retry Logic

```typescript
// Retry failed notifications
@Cron('0 */5 * * * *') // Every 5 minutes
async retryFailedNotifications() {
  const failed = await notificationRepository.find({
    where: {
      status: NotificationStatus.FAILED,
      createdAt: MoreThan(new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
    },
    take: 50
  });

  for (const notification of failed) {
    // Check retry count
    const retryCount = notification.metadata?.retryCount || 0;
    if (retryCount >= 3) {
      continue; // Max retries reached
    }

    // Retry
    notification.status = NotificationStatus.PENDING;
    notification.metadata = {
      ...notification.metadata,
      retryCount: retryCount + 1,
      lastRetryAt: new Date()
    };

    await notificationRepository.save(notification);
  }
}
```

---

## Key Principles

1. **Multi-channel delivery** - Email, Push, SMS, In-App, Webhook
2. **Event-driven architecture** - Listen to events from all services
3. **Provider abstraction** - Easily swap SendGrid/SES, FCM/APNS, Twilio/SNS
4. **Delivery tracking** - Full audit trail from creation to read
5. **User preferences** - Respect opt-out and channel preferences
6. **Retry logic** - Automatic retry for failed notifications
7. **Analytics** - Comprehensive metrics on delivery and engagement
8. **Template system** - Reusable notification templates
9. **Queue processing** - Batch processing for high volume
10. **Webhook handling** - Process provider webhooks for status updates

---

## Security & Compliance

### Data Privacy
- Store minimal user data (only IDs, no PII)
- Fetch fresh user data from identity-service when sending
- GDPR: Allow users to export/delete notification history
- Respect unsubscribe requests immediately

### Email Security
- SPF/DKIM/DMARC configured
- Unsubscribe links in all marketing emails
- Double opt-in for marketing preferences
- Track bounce/complaint rates

### Push Notification Security
- Validate push tokens before sending
- Revoke invalid tokens automatically
- Don't send sensitive data in push payload
- Use data field for metadata, not notification field

### Rate Limiting
- Max notifications per user per hour
- Max marketing emails per user per day
- Respect "quiet hours" for push notifications
- Exponential backoff for retries

---

## Integration with Other Services

All services publish events that trigger notifications:

- **identity-service** - User registration, password reset, profile approval
- **orders-service** - Order confirmation, shipping updates
- **payments-service** - Payment success, invoice created
- **events-service** - Event reminders, RSVP confirmations
- **messaging-service** - New messages
- **crm-service** - Marketing campaigns
- **community-service** - Likes, comments, follows
- **artwork-service** - Artwork featured, price drop alerts
