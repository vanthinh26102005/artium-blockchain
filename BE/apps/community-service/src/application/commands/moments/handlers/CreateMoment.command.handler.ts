import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { CreateMomentCommand } from '../CreateMoment.command';
import { IMomentRepository, Moment } from '../../../../domain';

@CommandHandler(CreateMomentCommand)
export class CreateMomentHandler implements ICommandHandler<
  CreateMomentCommand,
  Moment
> {
  private readonly logger = new Logger(CreateMomentHandler.name);

  constructor(
    @Inject(IMomentRepository)
    private readonly momentRepository: IMomentRepository,
  ) {}

  async execute(command: CreateMomentCommand): Promise<Moment> {
    const reqId = `create-moment:${Date.now()}`;
    this.logger.log(`[${reqId}] Executing create moment command`, {
      userId: command.input.userId,
    });

    try {
      const { taggedArtworkIds, ...momentData } = command.input;

      // Set expiration for ephemeral content (24 hours by default)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const momentInput = {
        ...momentData,
        expiresAt,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        isArchived: false,
        isPinned: momentData.isPinned ?? false,
      };

      const moment = await this.momentRepository.create(momentInput);

      this.logger.log(`[${reqId}] Moment created successfully`, {
        momentId: moment.id,
        userId: moment.userId,
      });

      // TODO: Handle tagged artworks if provided
      // TODO: Publish event via outbox for activity feed

      return moment;
    } catch (error) {
      this.logger.error(`[${reqId}] Failed to create moment`, error.stack);

      if (error.status && error.status !== 500) {
        throw error;
      }

      throw RpcExceptionHelper.internalError('Failed to create moment');
    }
  }
}
