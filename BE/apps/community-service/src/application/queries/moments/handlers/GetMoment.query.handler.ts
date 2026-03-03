import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GetMomentQuery } from '../GetMoment.query';
import { IMomentRepository, Moment } from '../../../../domain';

@QueryHandler(GetMomentQuery)
export class GetMomentHandler implements IQueryHandler<
  GetMomentQuery,
  Moment | null
> {
  private readonly logger = new Logger(GetMomentHandler.name);

  constructor(
    @Inject(IMomentRepository)
    private readonly momentRepository: IMomentRepository,
  ) {}

  async execute(query: GetMomentQuery): Promise<Moment | null> {
    this.logger.debug(`Getting moment by ID: ${query.id}`);

    const moment = await this.momentRepository.findById(query.id);

    if (!moment) {
      this.logger.debug(`Moment not found: ${query.id}`);
      return null;
    }

    return moment;
  }
}
