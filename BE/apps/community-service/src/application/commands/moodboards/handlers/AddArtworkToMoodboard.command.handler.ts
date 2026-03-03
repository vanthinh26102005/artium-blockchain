import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { AddArtworkToMoodboardCommand } from '../AddArtworkToMoodboard.command';
import {
  IMoodboardRepository,
  IMoodboardArtworkRepository,
  MoodboardArtwork,
} from '../../../../domain';

@CommandHandler(AddArtworkToMoodboardCommand)
export class AddArtworkToMoodboardHandler implements ICommandHandler<
  AddArtworkToMoodboardCommand,
  MoodboardArtwork
> {
  private readonly logger = new Logger(AddArtworkToMoodboardHandler.name);

  constructor(
    @Inject(IMoodboardRepository)
    private readonly moodboardRepository: IMoodboardRepository,
    @Inject(IMoodboardArtworkRepository)
    private readonly moodboardArtworkRepository: IMoodboardArtworkRepository,
  ) {}

  async execute(
    command: AddArtworkToMoodboardCommand,
  ): Promise<MoodboardArtwork> {
    const reqId = `add-artwork-moodboard:${Date.now()}`;
    this.logger.log(`[${reqId}] Executing add artwork to moodboard command`, {
      moodboardId: command.input.moodboardId,
      artworkId: command.input.artworkId,
      userId: command.userId,
    });

    try {
      const moodboard = await this.moodboardRepository.findById(
        command.input.moodboardId,
      );

      if (!moodboard) {
        this.logger.warn(
          `[${reqId}] Moodboard not found: ${command.input.moodboardId}`,
        );
        throw RpcExceptionHelper.notFound('Moodboard not found');
      }

      // Check ownership or collaborator status
      const isOwner = moodboard.userId === command.userId;
      const isCollaborator =
        moodboard.collaboratorIds?.includes(command.userId) ?? false;

      if (!isOwner && !isCollaborator) {
        this.logger.warn(
          `[${reqId}] User ${command.userId} not authorized to add to moodboard ${command.input.moodboardId}`,
        );
        throw RpcExceptionHelper.forbidden(
          'You do not have permission to add artworks to this moodboard',
        );
      }

      // Check if artwork is already in moodboard
      const exists = await this.moodboardArtworkRepository.isArtworkInMoodboard(
        command.input.moodboardId,
        command.input.artworkId,
      );

      if (exists) {
        this.logger.warn(
          `[${reqId}] Artwork ${command.input.artworkId} already in moodboard`,
        );
        throw RpcExceptionHelper.conflict(
          'Artwork is already in this moodboard',
        );
      }

      const moodboardArtwork = await this.moodboardArtworkRepository.addArtwork(
        command.input.moodboardId,
        command.input.artworkId,
        {
          displayOrder: command.input.displayOrder ?? 0,
          notes: command.input.notes,
          tags: command.input.tags,
          isFavorite: command.input.isFavorite ?? false,
          artworkTitle: command.input.artworkTitle,
          artworkImageUrl: command.input.artworkImageUrl,
          artworkPrice: command.input.artworkPrice?.toString(),
          artworkSellerId: command.input.artworkSellerId,
          viewCount: 0,
          hasInquired: false,
          wasPurchased: false,
        },
      );

      // Increment artwork count
      await this.moodboardRepository.incrementArtworkCount(
        command.input.moodboardId,
        1,
      );

      this.logger.log(`[${reqId}] Artwork added to moodboard successfully`, {
        moodboardId: command.input.moodboardId,
        artworkId: command.input.artworkId,
      });

      return moodboardArtwork;
    } catch (error) {
      this.logger.error(
        `[${reqId}] Failed to add artwork to moodboard`,
        error.stack,
      );

      if (error.status && error.status !== 500) {
        throw error;
      }

      throw RpcExceptionHelper.internalError(
        'Failed to add artwork to moodboard',
      );
    }
  }
}
