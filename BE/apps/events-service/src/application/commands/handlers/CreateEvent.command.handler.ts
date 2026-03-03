import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventStatus, RpcExceptionHelper } from '@app/common';
import { Event } from '../../../domain/entities';
import { CreateEventCommand } from '../CreateEvent.command';
import {
  normalizeEventStatus,
  normalizeEventType,
  normalizeLocation,
  parseDate,
} from '../../../domain/utils/event-mapper';

@CommandHandler(CreateEventCommand)
export class CreateEventHandler
  implements ICommandHandler<CreateEventCommand>
{
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async execute(command: CreateEventCommand): Promise<Event> {
    const data = command.data;

    if (!data.creatorId) {
      throw RpcExceptionHelper.badRequest('creatorId is required');
    }

    if (!data.title?.trim()) {
      throw RpcExceptionHelper.badRequest('title is required');
    }

    const startTime = parseDate(data.startTime ?? null);
    const endTime = parseDate(data.endTime ?? null);
    if (startTime && endTime && endTime <= startTime) {
      throw RpcExceptionHelper.badRequest(
        'endTime must be after startTime',
      );
    }

    const status = normalizeEventStatus(data.status);

    const event = this.eventRepository.create({
      creatorId: data.creatorId,
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      type: normalizeEventType(data.type),
      status,
      startTime: startTime ?? undefined,
      endTime: endTime ?? undefined,
      timezone: data.timezone ?? undefined,
      location: normalizeLocation(data.location ?? null),
      coverImageUrl: data.coverImageUrl ?? undefined,
      isPublic: data.isPublic ?? true,
      inviteOnly: data.inviteOnly ?? false,
      requiresRegistration: data.requiresRegistration ?? false,
      maxAttendees: data.maxAttendees ?? undefined,
      registrationDeadline: parseDate(data.registrationDeadline ?? null),
      attendeeCount: 0,
      isFree: data.isFree ?? true,
      ticketPrice:
        data.ticketPrice !== undefined && data.ticketPrice !== null
          ? String(data.ticketPrice)
          : undefined,
      currency: data.currency ?? undefined,
      externalUrl: data.externalUrl ?? undefined,
      tags: data.tags ?? undefined,
      contactEmail: data.contactEmail ?? undefined,
      contactPhone: data.contactPhone ?? undefined,
      publishedAt: status === EventStatus.PUBLISHED ? new Date() : undefined,
    });

    return this.eventRepository.save(event);
  }
}
