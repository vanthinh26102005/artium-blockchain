import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GetFollowingQuery } from '../GetFollowing.query';
import { IFollowerRepository, Follower } from '../../../../domain';

@QueryHandler(GetFollowingQuery)
export class GetFollowingHandler implements IQueryHandler<
  GetFollowingQuery,
  Follower[]
> {
  private readonly logger = new Logger(GetFollowingHandler.name);

  constructor(
    @Inject(IFollowerRepository)
    private readonly followerRepository: IFollowerRepository,
  ) {}

  async execute(query: GetFollowingQuery): Promise<Follower[]> {
    this.logger.debug(`Getting following for user: ${query.userId}`);

    const options = query.options || {};
    const following = await this.followerRepository.findFollowing(
      query.userId,
      options.skip,
      options.take ?? 20,
    );

    return following;
  }
}
