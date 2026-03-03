import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { UnfollowUserCommand } from '../UnfollowUser.command';
import { IFollowerRepository } from '../../../../domain';

@CommandHandler(UnfollowUserCommand)
export class UnfollowUserHandler implements ICommandHandler<
  UnfollowUserCommand,
  boolean
> {
  private readonly logger = new Logger(UnfollowUserHandler.name);

  constructor(
    @Inject(IFollowerRepository)
    private readonly followerRepository: IFollowerRepository,
  ) {}

  async execute(command: UnfollowUserCommand): Promise<boolean> {
    const reqId = `unfollow-user:${Date.now()}`;
    const { followingUserId, followedUserId } = command;

    this.logger.log(`[${reqId}] Executing unfollow user command`, {
      followingUserId,
      followedUserId,
    });

    try {
      // Check if following
      const isFollowing = await this.followerRepository.isFollowing(
        followingUserId,
        followedUserId,
      );

      if (!isFollowing) {
        throw RpcExceptionHelper.badRequest('You are not following this user');
      }

      // Check if it was mutual before unfollowing
      const wasMutual = await this.followerRepository.checkMutualFollow(
        followingUserId,
        followedUserId,
      );

      const unfollowed = await this.followerRepository.unfollow(
        followingUserId,
        followedUserId,
      );

      // Update mutual status for the other user if it was mutual
      if (wasMutual) {
        await this.followerRepository.updateMutualStatus(
          followedUserId,
          followingUserId,
          false,
        );
      }

      this.logger.log(`[${reqId}] User unfollowed successfully`, {
        followingUserId,
        followedUserId,
      });

      return unfollowed;
    } catch (error) {
      this.logger.error(`[${reqId}] Failed to unfollow user`, error.stack);

      if (error.status && error.status !== 500) {
        throw error;
      }

      throw RpcExceptionHelper.internalError('Failed to unfollow user');
    }
  }
}
