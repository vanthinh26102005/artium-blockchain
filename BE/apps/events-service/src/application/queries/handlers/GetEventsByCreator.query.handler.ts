import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../../domain/entities';
import { GetEventsByCreatorQuery } from '../GetEventsByCreator.query';

@QueryHandler(GetEventsByCreatorQuery)
export class GetEventsByCreatorHandler implements IQueryHandler<GetEventsByCreatorQuery> {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async execute(query: GetEventsByCreatorQuery): Promise<Event[]> {
    return this.eventRepository.find({
      where: { creatorId: query.creatorId },
      order: { createdAt: 'DESC' },
    });
  }
}
