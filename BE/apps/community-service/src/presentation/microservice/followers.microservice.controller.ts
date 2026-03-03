import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  FollowUserCommand,
  UnfollowUserCommand,
  GetFollowersQuery,
  GetFollowingQuery,
} from '../../application';
import { FollowUserInput, FollowerObject } from '../../domain';

@Controller()
export class FollowersMicroserviceController {
  private readonly logger = new Logger(FollowersMicroserviceController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern({ cmd: 'follow_user' })
  async followUser(@Payload() input: FollowUserInput): Promise<FollowerObject> {
    this.logger.log(
      `[Microservice] User ${input.followingUserId} following ${input.followedUserId}`,
    );
    return this.commandBus.execute(new FollowUserCommand(input));
  }

  @MessagePattern({ cmd: 'unfollow_user' })
  async unfollowUser(
    @Payload() data: { followingUserId: string; followedUserId: string },
  ): Promise<boolean> {
    this.logger.log(
      `[Microservice] User ${data.followingUserId} unfollowing ${data.followedUserId}`,
    );
    return this.commandBus.execute(
      new UnfollowUserCommand(data.followingUserId, data.followedUserId),
    );
  }

  @MessagePattern({ cmd: 'get_followers' })
  async getFollowers(
    @Payload()
    data: {
      userId: string;
      options?: { skip?: number; take?: number };
    },
  ): Promise<FollowerObject[]> {
    this.logger.log(
      `[Microservice] Getting followers for user: ${data.userId}`,
    );
    return this.queryBus.execute(
      new GetFollowersQuery(data.userId, data.options),
    );
  }

  @MessagePattern({ cmd: 'get_following' })
  async getFollowing(
    @Payload()
    data: {
      userId: string;
      options?: { skip?: number; take?: number };
    },
  ): Promise<FollowerObject[]> {
    this.logger.log(
      `[Microservice] Getting following for user: ${data.userId}`,
    );
    return this.queryBus.execute(
      new GetFollowingQuery(data.userId, data.options),
    );
  }
}
