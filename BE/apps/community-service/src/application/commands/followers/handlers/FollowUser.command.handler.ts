import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { FollowUserCommand } from '../FollowUser.command';
import { IFollowerRepository, Follower } from '../../../../domain';

@CommandHandler(FollowUserCommand)
export class FollowUserHandler implements ICommandHandler<
  FollowUserCommand,
  Follower
> {
  private readonly logger = new Logger(FollowUserHandler.name);

  constructor(
    @Inject(IFollowerRepository)
    private readonly followerRepository: IFollowerRepository,
  ) {}

  async execute(command: FollowUserCommand): Promise<Follower> {
    const reqId = `follow-user:${Date.now()}`;
    const { followingUserId, followedUserId } = command.input;

    this.logger.log(`[${reqId}] Executing follow user command`, {
      followingUserId,
      followedUserId,
    });

    try {
      // Cannot follow yourself
      if (followingUserId === followedUserId) {
        throw RpcExceptionHelper.badRequest('You cannot follow yourself');
      }

      // Check if already following
      const isFollowing = await this.followerRepository.isFollowing(
        followingUserId,
        followedUserId,
      );

      if (isFollowing) {
        throw RpcExceptionHelper.conflict(
          'You are already following this user',
        );
      }

      const follower = await this.followerRepository.follow(command.input);

      // Check and update mutual follow status
      const isMutual = await this.followerRepository.checkMutualFollow(
        followingUserId,
        followedUserId,
      );

      if (isMutual) {
        await this.followerRepository.updateMutualStatus(
          followingUserId,
          followedUserId,
          true,
        );
        await this.followerRepository.updateMutualStatus(
          followedUserId,
          followingUserId,
          true,
        );
      }

      this.logger.log(`[${reqId}] User followed successfully`, {
        followingUserId,
        followedUserId,
        isMutual,
      });

      // TODO: Publish event via outbox for notifications and activity feed

      return follower;
    } catch (error) {
      this.logger.error(`[${reqId}] Failed to follow user`, error.stack);

      if (error.status && error.status !== 500) {
        throw error;
      }

      throw RpcExceptionHelper.internalError('Failed to follow user');
    }
  }
}
