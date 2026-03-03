import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ITransactionService, RpcExceptionHelper } from '@app/common';
import { EntityManager } from 'typeorm';
import {
  LikeStatusResult,
  SetLikeStatusCommand,
} from '../SetLikeStatus.command';
import {
  ICommentRepository,
  ILikeRepository,
  IMomentRepository,
  IMoodboardRepository,
  LikeableType,
} from '../../../../domain';

@CommandHandler(SetLikeStatusCommand)
export class SetLikeStatusHandler
  implements ICommandHandler<SetLikeStatusCommand, LikeStatusResult>
{
  private readonly logger = new Logger(SetLikeStatusHandler.name);

  constructor(
    @Inject(ILikeRepository)
    private readonly likeRepository: ILikeRepository,
    @Inject(IMomentRepository)
    private readonly momentRepository: IMomentRepository,
    @Inject(IMoodboardRepository)
    private readonly moodboardRepository: IMoodboardRepository,
    @Inject(ICommentRepository)
    private readonly commentRepository: ICommentRepository,
    @Inject(ITransactionService)
    private readonly transactionService: ITransactionService,
  ) {}

  async execute(command: SetLikeStatusCommand): Promise<LikeStatusResult> {
    const { input } = command;
    const reqId = `set-like:${Date.now()}`;

    if (!input.userId) {
      throw RpcExceptionHelper.badRequest('userId is required');
    }

    if (!input.likeableId) {
      throw RpcExceptionHelper.badRequest('likeableId is required');
    }

    this.logger.log(`[${reqId}] Setting like status`, {
      userId: input.userId,
      likeableType: input.likeableType,
      likeableId: input.likeableId,
      liked: input.liked,
    });

    try {
      return await this.transactionService.execute(async (manager) => {
        const existing = await this.likeRepository.findOne(
          {
            where: {
              userId: input.userId,
              likeableType: input.likeableType,
              likeableId: input.likeableId,
            },
          },
          manager,
        );

        if (input.liked) {
          if (existing) {
            return { liked: true, changed: false };
          }

          await this.likeRepository.create(
            {
              userId: input.userId,
              likeableType: input.likeableType,
              likeableId: input.likeableId,
              contentOwnerId: input.contentOwnerId ?? null,
            },
            manager,
          );

          await this.incrementLikeCount(
            input.likeableType,
            input.likeableId,
            1,
            manager,
          );

          return { liked: true, changed: true };
        }

        if (!existing) {
          return { liked: false, changed: false };
        }

        const removed = await this.likeRepository.delete(existing.id, manager);
        if (removed) {
          await this.incrementLikeCount(
            input.likeableType,
            input.likeableId,
            -1,
            manager,
          );
        }

        return { liked: false, changed: removed };
      });
    } catch (error: any) {
      this.logger.error(`[${reqId}] Failed to update like`, error?.stack);

      if (error?.status && error.status !== 500) {
        throw error;
      }

      throw RpcExceptionHelper.internalError('Failed to update like');
    }
  }

  private async incrementLikeCount(
    likeableType: LikeableType,
    likeableId: string,
    increment: number,
    manager?: EntityManager,
  ): Promise<void> {
    switch (likeableType) {
      case LikeableType.MOMENT:
        await this.momentRepository.incrementLikeCount(
          likeableId,
          increment,
          manager,
        );
        break;
      case LikeableType.MOODBOARD:
        await this.moodboardRepository.incrementLikeCount(
          likeableId,
          increment,
          manager,
        );
        break;
      case LikeableType.COMMENT:
        await this.commentRepository.incrementLikeCount(
          likeableId,
          increment,
          manager,
        );
        break;
      default:
        break;
    }
  }
}
