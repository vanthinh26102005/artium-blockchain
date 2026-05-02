import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventStatus, RpcExceptionHelper } from '@app/common';
import { Event } from '../../../domain/entities';
import { UpdateEventCommand } from '../UpdateEvent.command';
import {
  normalizeEventStatus,
  normalizeEventType,
  normalizeLocation,
  parseDate,
} from '../../../domain/utils/event-mapper';

@CommandHandler(UpdateEventCommand)
export class UpdateEventHandler implements ICommandHandler<UpdateEventCommand> {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async execute(command: UpdateEventCommand): Promise<Event | null> {
    const { eventId, userId, data } = command;

    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw RpcExceptionHelper.notFound('Event not found');
    }

    if (userId && event.creatorId !== userId) {
      throw RpcExceptionHelper.forbidden(
        'You are not allowed to update this event',
      );
    }

    if (data.title !== undefined) {
      event.title = data.title?.trim() || event.title;
    }

    if (data.description !== undefined) {
      event.description = data.description?.trim() || undefined;
    }

    if (data.type !== undefined) {
      event.type = normalizeEventType(data.type);
    }

    if (data.status !== undefined) {
      event.status = normalizeEventStatus(data.status, event.status);
      if (event.status === EventStatus.PUBLISHED && !event.publishedAt) {
        event.publishedAt = new Date();
      }
    }

    const startTime = parseDate(data.startTime ?? undefined);
    if (startTime !== null && startTime !== undefined) {
      event.startTime = startTime;
    }

    const endTime = parseDate(data.endTime ?? undefined);
    if (endTime !== null && endTime !== undefined) {
      event.endTime = endTime;
    }

    if (data.startTime !== undefined && data.endTime !== undefined) {
      if (
        event.startTime &&
        event.endTime &&
        event.endTime <= event.startTime
      ) {
        throw RpcExceptionHelper.badRequest('endTime must be after startTime');
      }
    }

    if (data.timezone !== undefined) {
      event.timezone = data.timezone || undefined;
    }

    if (data.location !== undefined) {
      event.location = normalizeLocation(data.location);
    }

    if (data.coverImageUrl !== undefined) {
      event.coverImageUrl = data.coverImageUrl || undefined;
    }

    if (data.isPublic !== undefined) {
      event.isPublic = data.isPublic;
    }

    if (data.inviteOnly !== undefined) {
      event.inviteOnly = data.inviteOnly;
    }

    if (data.requiresRegistration !== undefined) {
      event.requiresRegistration = data.requiresRegistration;
    }

    if (data.maxAttendees !== undefined) {
      event.maxAttendees = data.maxAttendees ?? undefined;
    }

    if (data.registrationDeadline !== undefined) {
      event.registrationDeadline =
        parseDate(data.registrationDeadline) ?? undefined;
    }

    if (data.isFree !== undefined) {
      event.isFree = data.isFree;
    }

    if (data.ticketPrice !== undefined) {
      event.ticketPrice =
        data.ticketPrice !== null && data.ticketPrice !== undefined
          ? String(data.ticketPrice)
          : undefined;
    }

    if (data.currency !== undefined) {
      event.currency = data.currency ?? undefined;
    }

    if (data.externalUrl !== undefined) {
      event.externalUrl = data.externalUrl ?? undefined;
    }

    if (data.tags !== undefined) {
      event.tags = data.tags ?? undefined;
    }

    if (data.contactEmail !== undefined) {
      event.contactEmail = data.contactEmail ?? undefined;
    }

    if (data.contactPhone !== undefined) {
      event.contactPhone = data.contactPhone ?? undefined;
    }

    if (data.cancellationReason !== undefined) {
      event.cancellationReason = data.cancellationReason ?? undefined;
    }

    if (data.cancelledAt !== undefined) {
      event.cancelledAt = parseDate(data.cancelledAt) ?? undefined;
    }

    if (data.publishedAt !== undefined) {
      event.publishedAt = parseDate(data.publishedAt) ?? undefined;
    }

    return this.eventRepository.save(event);
  }
}
