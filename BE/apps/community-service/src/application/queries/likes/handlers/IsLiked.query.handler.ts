import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { IsLikedQuery } from '../IsLiked.query';
import { ILikeRepository } from '../../../../domain';

@QueryHandler(IsLikedQuery)
export class IsLikedHandler implements IQueryHandler<IsLikedQuery, boolean> {
  private readonly logger = new Logger(IsLikedHandler.name);

  constructor(
    @Inject(ILikeRepository)
    private readonly likeRepository: ILikeRepository,
  ) {}

  async execute(query: IsLikedQuery): Promise<boolean> {
    this.logger.debug(
      `Checking like status for ${query.likeableType}:${query.likeableId} by ${query.userId}`,
    );

    return this.likeRepository.isLiked(
      query.userId,
      query.likeableType,
      query.likeableId,
    );
  }
}
