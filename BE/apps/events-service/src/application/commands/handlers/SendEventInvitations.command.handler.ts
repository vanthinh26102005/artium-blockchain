import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ITransactionService,
  NotificationTriggerEvent,
  RpcExceptionHelper,
} from '@app/common';
import { OutboxService } from '@app/outbox';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import { Event } from '../../../domain/entities';
import { SendEventInvitationsCommand } from '../SendEventInvitations.command';

const normalizeBaseUrl = (value: string): string => value.replace(/\/$/, '');

const buildEventUrl = (eventId: string, overrideUrl?: string): string => {
  if (overrideUrl?.trim()) return overrideUrl.trim();
  const baseUrl = normalizeBaseUrl(
    process.env.CLIENT_URL || 'http://localhost:3000',
  );
  return `${baseUrl}/events/${eventId}`;
};

const formatDate = (value?: Date | null): string | undefined => {
  if (!value) return undefined;
  return value.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTimeRange = (
  start?: Date | null,
  end?: Date | null,
  timeZone?: string | null,
): string | undefined => {
  if (!start) return undefined;
  const formatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timeZone || undefined,
  });
  const startTime = formatter.format(start);
  const endTime = end ? formatter.format(end) : undefined;
  return endTime ? `${startTime} - ${endTime}` : startTime;
};

const buildLocationLine = (
  event: Event,
): { label?: string; detail?: string } => {
  const location = event.location;
  if (!location) return {};

  if (location.type === 'VIRTUAL') {
    return {
      label: 'Online event',
      detail: location.virtualUrl || undefined,
    };
  }

  const address = location.address;
  const addressParts = [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.postalCode,
    address?.country,
  ].filter(Boolean);

  const addressLine = addressParts.length ? addressParts.join(', ') : undefined;
  const venue = location.venueName || location.accessInstructions || undefined;
  const label = venue || addressLine || 'In-person event';
  const detail = venue && addressLine ? addressLine : undefined;

  return { label, detail };
};

@CommandHandler(SendEventInvitationsCommand)
export class SendEventInvitationsHandler implements ICommandHandler<SendEventInvitationsCommand> {
  private readonly logger = new Logger(SendEventInvitationsHandler.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @Inject(ITransactionService)
    private readonly transactionService: ITransactionService,
    private readonly outboxService: OutboxService,
  ) {}

  async execute(
    command: SendEventInvitationsCommand,
  ): Promise<{ success: true; invitedCount: number }> {
    const data = command.data;

    if (!data.eventId) {
      throw RpcExceptionHelper.badRequest('eventId is required');
    }

    if (!data.recipients || data.recipients.length === 0) {
      throw RpcExceptionHelper.badRequest('recipients are required');
    }

    const event = await this.eventRepository.findOne({
      where: { id: data.eventId },
    });

    if (!event) {
      throw RpcExceptionHelper.notFound('Event not found');
    }

    if (data.senderId && event.creatorId !== data.senderId) {
      throw RpcExceptionHelper.forbidden(
        'You are not allowed to invite attendees to this event',
      );
    }

    const eventUrl = buildEventUrl(event.id, data.eventUrl);
    const timeZone = event.timezone || undefined;
    const eventDate = formatDate(event.startTime ?? undefined);
    const eventTime = formatTimeRange(
      event.startTime ?? undefined,
      event.endTime ?? undefined,
      timeZone,
    );
    const locationLine = buildLocationLine(event);

    const senderName = data.senderName?.trim() || 'Artium Event Host';
    const senderEmail = data.senderEmail?.trim();
    const messageHtml = data.message
      ? data.message.replace(/\r?\n/g, '<br/>')
      : undefined;

    const uniqueRecipients = Array.from(
      new Map(
        data.recipients
          .filter((recipient) => recipient.email?.trim())
          .map((recipient) => [
            recipient.email.trim().toLowerCase(),
            recipient,
          ]),
      ).values(),
    );

    await this.transactionService.execute(async (manager) => {
      for (const recipient of uniqueRecipients) {
        const recipientEmail = recipient.email.trim();
        const recipientName = recipient.name?.trim();
        const firstName = recipientName?.split(' ')[0];

        await this.outboxService.createOutboxMessage(
          {
            aggregateType: 'event',
            aggregateId: event.id,
            eventType: RoutingKey.SEND_TRANSACTIONAL_EMAIL,
            payload: {
              recipientEmail,
              title: `Invitation: ${event.title}`,
              subject: `You're invited to ${event.title}`,
              template: 'event-invite',
              context: {
                ...(firstName ? { firstName } : {}),
                eventTitle: event.title,
                ...(eventDate ? { eventDate } : {}),
                ...(eventTime ? { eventTime } : {}),
                ...(timeZone ? { timeZone } : {}),
                ...(locationLine.label
                  ? { locationLabel: locationLine.label }
                  : {}),
                ...(locationLine.detail
                  ? { locationDetail: locationLine.detail }
                  : {}),
                ...(event.coverImageUrl
                  ? { coverImageUrl: event.coverImageUrl }
                  : {}),
                ...(messageHtml ? { messageHtml } : {}),
                hostName: senderName,
                ...(senderEmail ? { hostEmail: senderEmail } : {}),
                eventUrl,
              },
              body: event.title,
              metadata: {
                eventId: event.id,
                recipientEmail,
                ...(recipient.id ? { recipientId: recipient.id } : {}),
              },
              triggerEvent: NotificationTriggerEvent.GENERIC_ALERT,
              userId: recipient.id,
            },
            exchange: ExchangeName.NOTIFICATION_EVENTS,
            routingKey: RoutingKey.SEND_TRANSACTIONAL_EMAIL,
          },
          manager,
        );
      }
    });

    this.logger.log(
      `Queued ${uniqueRecipients.length} invitation emails for event ${event.id}`,
    );

    return { success: true, invitedCount: uniqueRecipients.length };
  }
}
