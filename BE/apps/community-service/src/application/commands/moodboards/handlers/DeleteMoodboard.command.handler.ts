import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { DeleteMoodboardCommand } from '../DeleteMoodboard.command';
import { IMoodboardRepository } from '../../../../domain';

@CommandHandler(DeleteMoodboardCommand)
export class DeleteMoodboardHandler implements ICommandHandler<
  DeleteMoodboardCommand,
  boolean
> {
  private readonly logger = new Logger(DeleteMoodboardHandler.name);

  constructor(
    @Inject(IMoodboardRepository)
    private readonly moodboardRepository: IMoodboardRepository,
  ) {}

  async execute(command: DeleteMoodboardCommand): Promise<boolean> {
    const reqId = `delete-moodboard:${Date.now()}`;
    this.logger.log(`[${reqId}] Executing delete moodboard command`, {
      moodboardId: command.id,
      userId: command.userId,
    });

    try {
      const existingMoodboard = await this.moodboardRepository.findById(
        command.id,
      );

      if (!existingMoodboard) {
        this.logger.warn(`[${reqId}] Moodboard not found: ${command.id}`);
        throw RpcExceptionHelper.notFound('Moodboard not found');
      }

      // Only owner can delete
      if (existingMoodboard.userId !== command.userId) {
        this.logger.warn(
          `[${reqId}] User ${command.userId} attempted to delete moodboard owned by ${existingMoodboard.userId}`,
        );
        throw RpcExceptionHelper.forbidden(
          'You do not have permission to delete this moodboard',
        );
      }

      await this.moodboardRepository.delete(command.id);

      this.logger.log(`[${reqId}] Moodboard deleted successfully`, {
        moodboardId: command.id,
      });

      // TODO: Publish event via outbox for cleanup

      return true;
    } catch (error) {
      this.logger.error(`[${reqId}] Failed to delete moodboard`, error.stack);

      if (error.status && error.status !== 500) {
        throw error;
      }

      throw RpcExceptionHelper.internalError('Failed to delete moodboard');
    }
  }
}
