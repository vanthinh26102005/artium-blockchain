import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ListUserMomentsQuery } from '../ListUserMoments.query';
import { IMomentRepository, Moment } from '../../../../domain';

@QueryHandler(ListUserMomentsQuery)
export class ListUserMomentsHandler implements IQueryHandler<
  ListUserMomentsQuery,
  Moment[]
> {
  private readonly logger = new Logger(ListUserMomentsHandler.name);

  constructor(
    @Inject(IMomentRepository)
    private readonly momentRepository: IMomentRepository,
  ) {}

  async execute(query: ListUserMomentsQuery): Promise<Moment[]> {
    this.logger.debug(`Listing moments for user: ${query.userId}`);

    const options = query.options || {};
    const where: any = {};

    if (!options.includeArchived) {
      where.isArchived = false;
    }

    const moments = await this.momentRepository.findByUserId(query.userId, {
      where,
      skip: options.skip,
      take: options.take ?? 20,
      orderBy: { createdAt: 'desc' },
    });

    return moments;
  }
}
