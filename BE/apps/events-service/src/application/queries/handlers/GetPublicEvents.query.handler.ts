import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventStatus } from '@app/common';
import { Event } from '../../../domain/entities';
import { GetPublicEventsQuery } from '../GetPublicEvents.query';

@QueryHandler(GetPublicEventsQuery)
export class GetPublicEventsHandler implements IQueryHandler<GetPublicEventsQuery> {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async execute(query: GetPublicEventsQuery): Promise<Event[]> {
    const { take, skip } = query.options ?? {};
    return this.eventRepository.find({
      where: { isPublic: true, status: EventStatus.PUBLISHED },
      order: { startTime: 'ASC', createdAt: 'DESC' },
      ...(typeof take === 'number' ? { take } : {}),
      ...(typeof skip === 'number' ? { skip } : {}),
    });
  }
}
