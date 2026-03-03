import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { CreateMoodboardCommand } from '../CreateMoodboard.command';
import { IMoodboardRepository, Moodboard } from '../../../../domain';

@CommandHandler(CreateMoodboardCommand)
export class CreateMoodboardHandler implements ICommandHandler<
  CreateMoodboardCommand,
  Moodboard
> {
  private readonly logger = new Logger(CreateMoodboardHandler.name);

  constructor(
    @Inject(IMoodboardRepository)
    private readonly moodboardRepository: IMoodboardRepository,
  ) {}

  async execute(command: CreateMoodboardCommand): Promise<Moodboard> {
    const reqId = `create-moodboard:${Date.now()}`;
    this.logger.log(`[${reqId}] Executing create moodboard command`, {
      userId: command.input.userId,
      title: command.input.title,
    });

    try {
      const moodboardInput = {
        ...command.input,
        artworkCount: 0,
        likeCount: 0,
        viewCount: 0,
        shareCount: 0,
        displayOrder: 0,
        isPrivate: command.input.isPrivate ?? false,
        isCollaborative: command.input.isCollaborative ?? false,
      };

      const moodboard = await this.moodboardRepository.create(moodboardInput);

      this.logger.log(`[${reqId}] Moodboard created successfully`, {
        moodboardId: moodboard.id,
        userId: moodboard.userId,
      });

      // TODO: Publish event via outbox for activity feed

      return moodboard;
    } catch (error) {
      this.logger.error(`[${reqId}] Failed to create moodboard`, error.stack);

      if (error.status && error.status !== 500) {
        throw error;
      }

      throw RpcExceptionHelper.internalError('Failed to create moodboard');
    }
  }
}
