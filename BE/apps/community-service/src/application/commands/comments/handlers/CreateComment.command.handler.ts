import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ITransactionService, RpcExceptionHelper } from '@app/common';
import { CreateCommentCommand } from '../CreateComment.command';
import {
  Comment,
  CommentableType,
  ICommentRepository,
  IMomentRepository,
} from '../../../../domain';

@CommandHandler(CreateCommentCommand)
export class CreateCommentHandler
  implements ICommandHandler<CreateCommentCommand, Comment>
{
  private readonly logger = new Logger(CreateCommentHandler.name);

  constructor(
    @Inject(ICommentRepository)
    private readonly commentRepository: ICommentRepository,
    @Inject(IMomentRepository)
    private readonly momentRepository: IMomentRepository,
    @Inject(ITransactionService)
    private readonly transactionService: ITransactionService,
  ) {}

  async execute(command: CreateCommentCommand): Promise<Comment> {
    const { input } = command;
    const reqId = `create-comment:${Date.now()}`;

    if (!input.userId) {
      throw RpcExceptionHelper.badRequest('userId is required');
    }

    if (!input.commentableId) {
      throw RpcExceptionHelper.badRequest('commentableId is required');
    }

    const content = input.content?.trim();
    if (!content) {
      throw RpcExceptionHelper.badRequest('Comment content is required');
    }

    this.logger.log(`[${reqId}] Creating comment`, {
      userId: input.userId,
      commentableType: input.commentableType,
      commentableId: input.commentableId,
    });

    try {
      return await this.transactionService.execute(async (manager) => {
        if (input.commentableType === CommentableType.MOMENT) {
          const moment = await this.momentRepository.findById(
            input.commentableId,
            manager,
          );
          if (!moment) {
            throw RpcExceptionHelper.notFound('Moment not found');
          }
        }

        if (input.parentCommentId) {
          const parentComment = await this.commentRepository.findById(
            input.parentCommentId,
            manager,
          );
          if (!parentComment) {
            throw RpcExceptionHelper.notFound('Parent comment not found');
          }
        }

        const comment = await this.commentRepository.create(
          {
            ...input,
            content,
          },
          manager,
        );

        if (input.parentCommentId) {
          await this.commentRepository.incrementReplyCount(
            input.parentCommentId,
            1,
            manager,
          );
        }

        if (input.commentableType === CommentableType.MOMENT) {
          await this.momentRepository.incrementCommentCount(
            input.commentableId,
            1,
            manager,
          );
        }

        this.logger.log(`[${reqId}] Comment created`, { commentId: comment.id });

        return comment;
      });
    } catch (error: any) {
      this.logger.error(`[${reqId}] Failed to create comment`, error?.stack);

      if (error?.status && error.status !== 500) {
        throw error;
      }

      throw RpcExceptionHelper.internalError('Failed to create comment');
    }
  }
}
