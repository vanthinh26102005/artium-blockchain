import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ITransactionService, RpcExceptionHelper } from '@app/common';
import {
  IArtworkLikeRepository,
  IArtworkRepository,
} from '../../../../domain';
import {
  ArtworkLikeStatusResult,
  SetArtworkLikeStatusCommand,
} from '../SetArtworkLikeStatus.command';

@CommandHandler(SetArtworkLikeStatusCommand)
export class SetArtworkLikeStatusHandler
  implements ICommandHandler<SetArtworkLikeStatusCommand, ArtworkLikeStatusResult>
{
  private readonly logger = new Logger(SetArtworkLikeStatusHandler.name);

  constructor(
    @Inject(IArtworkRepository)
    private readonly artworkRepository: IArtworkRepository,
    @Inject(IArtworkLikeRepository)
    private readonly artworkLikeRepository: IArtworkLikeRepository,
    @Inject(ITransactionService)
    private readonly transactionService: ITransactionService,
  ) {}

  async execute(
    command: SetArtworkLikeStatusCommand,
  ): Promise<ArtworkLikeStatusResult> {
    const { input } = command;
    const reqId = `set-artwork-like:${Date.now()}`;

    if (!input.userId) {
      throw RpcExceptionHelper.badRequest('userId is required');
    }

    if (!input.artworkId) {
      throw RpcExceptionHelper.badRequest('artworkId is required');
    }

    this.logger.log(`[${reqId}] Setting artwork like status`, {
      userId: input.userId,
      artworkId: input.artworkId,
      liked: input.liked,
    });

    try {
      return await this.transactionService.execute(async (manager) => {
        const artwork = await this.artworkRepository.findById(
          input.artworkId,
          manager,
        );

        if (!artwork) {
          throw RpcExceptionHelper.notFound('Artwork not found');
        }

        const existing = await this.artworkLikeRepository.findByUserAndArtwork(
          input.userId,
          input.artworkId,
          manager,
        );

        if (input.liked) {
          if (existing) {
            return {
              liked: true,
              changed: false,
              likeCount: artwork.likeCount ?? 0,
            };
          }

          const created = await this.artworkLikeRepository.createIfNotExists(
            {
              userId: input.userId,
              artworkId: input.artworkId,
              sellerId: artwork.sellerId,
            },
            manager,
          );

          if (!created) {
            return {
              liked: true,
              changed: false,
              likeCount: artwork.likeCount ?? 0,
            };
          }

          await this.artworkRepository.incrementLikeCount(
            input.artworkId,
            1,
            manager,
          );

          return {
            liked: true,
            changed: true,
            likeCount: (artwork.likeCount ?? 0) + 1,
          };
        }

        if (!existing) {
          return {
            liked: false,
            changed: false,
            likeCount: artwork.likeCount ?? 0,
          };
        }

        const removed = await this.artworkLikeRepository.delete(
          existing.id,
          manager,
        );

        if (removed) {
          await this.artworkRepository.incrementLikeCount(
            input.artworkId,
            -1,
            manager,
          );
        }

        return {
          liked: false,
          changed: removed,
          likeCount: removed
            ? Math.max((artwork.likeCount ?? 0) - 1, 0)
            : artwork.likeCount ?? 0,
        };
      });
    } catch (error: any) {
      this.logger.error(
        `[${reqId}] Failed to update artwork like status`,
        error?.stack || error,
      );

      if (error?.status && error.status !== 500) {
        throw error;
      }

      throw RpcExceptionHelper.internalError(
        'Failed to update artwork like status',
      );
    }
  }
}
