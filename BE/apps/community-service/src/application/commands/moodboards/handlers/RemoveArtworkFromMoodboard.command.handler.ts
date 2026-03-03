import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { RemoveArtworkFromMoodboardCommand } from '../RemoveArtworkFromMoodboard.command';
import {
  IMoodboardRepository,
  IMoodboardArtworkRepository,
} from '../../../../domain';

@CommandHandler(RemoveArtworkFromMoodboardCommand)
export class RemoveArtworkFromMoodboardHandler implements ICommandHandler<
  RemoveArtworkFromMoodboardCommand,
  boolean
> {
  private readonly logger = new Logger(RemoveArtworkFromMoodboardHandler.name);

  constructor(
    @Inject(IMoodboardRepository)
    private readonly moodboardRepository: IMoodboardRepository,
    @Inject(IMoodboardArtworkRepository)
    private readonly moodboardArtworkRepository: IMoodboardArtworkRepository,
  ) {}

  async execute(command: RemoveArtworkFromMoodboardCommand): Promise<boolean> {
    const reqId = `remove-artwork-moodboard:${Date.now()}`;
    this.logger.log(
      `[${reqId}] Executing remove artwork from moodboard command`,
      {
        moodboardId: command.moodboardId,
        artworkId: command.artworkId,
        userId: command.userId,
      },
    );

    try {
      const moodboard = await this.moodboardRepository.findById(
        command.moodboardId,
      );

      if (!moodboard) {
        this.logger.warn(
          `[${reqId}] Moodboard not found: ${command.moodboardId}`,
        );
        throw RpcExceptionHelper.notFound('Moodboard not found');
      }

      // Check ownership or collaborator status
      const isOwner = moodboard.userId === command.userId;
      const isCollaborator =
        moodboard.collaboratorIds?.includes(command.userId) ?? false;

      if (!isOwner && !isCollaborator) {
        this.logger.warn(
          `[${reqId}] User ${command.userId} not authorized to remove from moodboard ${command.moodboardId}`,
        );
        throw RpcExceptionHelper.forbidden(
          'You do not have permission to remove artworks from this moodboard',
        );
      }

      const removed = await this.moodboardArtworkRepository.removeArtwork(
        command.moodboardId,
        command.artworkId,
      );

      if (!removed) {
        this.logger.warn(
          `[${reqId}] Artwork ${command.artworkId} not found in moodboard`,
        );
        throw RpcExceptionHelper.notFound(
          'Artwork not found in this moodboard',
        );
      }

      // Decrement artwork count
      await this.moodboardRepository.incrementArtworkCount(
        command.moodboardId,
        -1,
      );

      this.logger.log(
        `[${reqId}] Artwork removed from moodboard successfully`,
        {
          moodboardId: command.moodboardId,
          artworkId: command.artworkId,
        },
      );

      return true;
    } catch (error) {
      this.logger.error(
        `[${reqId}] Failed to remove artwork from moodboard`,
        error.stack,
      );

      if (error.status && error.status !== 500) {
        throw error;
      }

      throw RpcExceptionHelper.internalError(
        'Failed to remove artwork from moodboard',
      );
    }
  }
}
