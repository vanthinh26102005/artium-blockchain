import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GetFollowersQuery } from '../GetFollowers.query';
import { IFollowerRepository, Follower } from '../../../../domain';

@QueryHandler(GetFollowersQuery)
export class GetFollowersHandler implements IQueryHandler<
  GetFollowersQuery,
  Follower[]
> {
  private readonly logger = new Logger(GetFollowersHandler.name);

  constructor(
    @Inject(IFollowerRepository)
    private readonly followerRepository: IFollowerRepository,
  ) {}

  async execute(query: GetFollowersQuery): Promise<Follower[]> {
    this.logger.debug(`Getting followers for user: ${query.userId}`);

    const options = query.options || {};
    const followers = await this.followerRepository.findFollowers(
      query.userId,
      options.skip,
      options.take ?? 20,
    );

    return followers;
  }
}
