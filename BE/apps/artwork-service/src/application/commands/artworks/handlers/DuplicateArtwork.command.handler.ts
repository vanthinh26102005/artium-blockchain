import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper, ArtworkStatus } from '@app/common';
import { DuplicateArtworkCommand } from '../DuplicateArtwork.command';
import { IArtworkRepository } from 'apps/artwork-service/src/domain';

@CommandHandler(DuplicateArtworkCommand)
export class DuplicateArtworkHandler implements ICommandHandler<DuplicateArtworkCommand> {
  private readonly logger = new Logger(DuplicateArtworkHandler.name);

  constructor(
    @Inject(IArtworkRepository)
    private readonly artworkRepo: IArtworkRepository,
  ) {}

  async execute(command: DuplicateArtworkCommand) {
    const reqId = `duplicateArtwork:${Date.now()}`;
    this.logger.log(`[${reqId}] duplicating artwork id=${command.artworkId}`);

    try {
      const original = await this.artworkRepo.findById(command.artworkId);

      if (!original) {
        this.logger.warn(
          `[${reqId}] artwork not found id=${command.artworkId}`,
        );
        throw RpcExceptionHelper.notFound(
          `Artwork ${command.artworkId} not found`,
        );
      }

      if (original.sellerId !== command.sellerId) {
        throw RpcExceptionHelper.badRequest(
          'Artwork does not belong to the specified seller',
        );
      }

      const duplicateTitle = command.title || `${original.title} (Copy)`;

      const duplicate = await this.artworkRepo.create({
        ...original,
        title: duplicateTitle,
        status: ArtworkStatus.DRAFT,
        isPublished: false,
        images: original.images,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        moodboardCount: 0,
      });

      this.logger.log(`[${reqId}] artwork duplicated successfully`, {
        originalId: original.id,
        duplicateId: duplicate.id,
      });

      return {
        original,
        duplicate,
      };
    } catch (err) {
      this.logger.error(`[${reqId}] duplicate failed`, err.stack || err);
      throw err;
    }
  }
}
