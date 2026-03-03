import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { UpdateMoodboardCommand } from '../UpdateMoodboard.command';
import { IMoodboardRepository, Moodboard } from '../../../../domain';

@CommandHandler(UpdateMoodboardCommand)
export class UpdateMoodboardHandler implements ICommandHandler<
  UpdateMoodboardCommand,
  Moodboard | null
> {
  private readonly logger = new Logger(UpdateMoodboardHandler.name);

  constructor(
    @Inject(IMoodboardRepository)
    private readonly moodboardRepository: IMoodboardRepository,
  ) {}

  async execute(command: UpdateMoodboardCommand): Promise<Moodboard | null> {
    const reqId = `update-moodboard:${Date.now()}`;
    this.logger.log(`[${reqId}] Executing update moodboard command`, {
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

      // Check ownership or collaborator status
      const isOwner = existingMoodboard.userId === command.userId;
      const isCollaborator =
        existingMoodboard.collaboratorIds?.includes(command.userId) ?? false;

      if (!isOwner && !isCollaborator) {
        this.logger.warn(
          `[${reqId}] User ${command.userId} attempted to update moodboard owned by ${existingMoodboard.userId}`,
        );
        throw RpcExceptionHelper.forbidden(
          'You do not have permission to update this moodboard',
        );
      }

      const updatedMoodboard = await this.moodboardRepository.update(
        command.id,
        command.input,
      );

      this.logger.log(`[${reqId}] Moodboard updated successfully`, {
        moodboardId: command.id,
      });

      return updatedMoodboard;
    } catch (error) {
      this.logger.error(`[${reqId}] Failed to update moodboard`, error.stack);

      if (error.status && error.status !== 500) {
        throw error;
      }

      throw RpcExceptionHelper.internalError('Failed to update moodboard');
    }
  }
}
