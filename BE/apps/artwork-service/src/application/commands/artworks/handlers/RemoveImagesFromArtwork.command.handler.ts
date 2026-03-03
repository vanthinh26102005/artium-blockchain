import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import {
  IArtworkRepository,
  GcsStorageService,
} from 'apps/artwork-service/src/domain';
import { RemoveImagesFromArtworkCommand } from '../RemoveImagesFromArtwork.command';

@CommandHandler(RemoveImagesFromArtworkCommand)
export class RemoveImagesFromArtworkHandler implements ICommandHandler<RemoveImagesFromArtworkCommand> {
  private readonly logger = new Logger(RemoveImagesFromArtworkHandler.name);

  constructor(
    @Inject(IArtworkRepository) private readonly repo: IArtworkRepository,
    private readonly gcsStorage: GcsStorageService,
  ) {}

  async execute(command: RemoveImagesFromArtworkCommand) {
    const reqId = `removeImages:${Date.now()}`;
    this.logger.log(
      `[${reqId}] removing images from artwork ${command.artworkId}`,
    );

    try {
      // Get existing artwork
      const existingArtwork = await this.repo.findById(command.artworkId);
      if (!existingArtwork) {
        this.logger.warn(
          `[${reqId}] artwork not found id=${command.artworkId}`,
        );
        throw RpcExceptionHelper.notFound(
          `Artwork ${command.artworkId} not found`,
        );
      }

      const currentImages = existingArtwork.images || [];
      if (currentImages.length === 0) {
        this.logger.log(
          `[${reqId}] no images to remove from artwork ${command.artworkId}`,
        );
        return existingArtwork;
      }

      // Find images to remove
      const imagesToRemove = currentImages.filter((image) =>
        command.imageIds.includes(image.id),
      );
      const remainingImages = currentImages.filter(
        (image) => !command.imageIds.includes(image.id),
      );

      // Delete images from GCS
      if (imagesToRemove.length > 0) {
        this.logger.log(
          `[${reqId}] Deleting ${imagesToRemove.length} images from GCS`,
        );
        const publicIdsToDelete = imagesToRemove.map((img) => img.publicId);
        await this.gcsStorage.deleteFiles(publicIdsToDelete);
        this.logger.log(`[${reqId}] Images deleted from GCS`);
      }

      // Update artwork with remaining images
      const updated = await this.repo.update(command.artworkId, {
        images: remainingImages,
      });

      this.logger.log(
        `[${reqId}] removed ${imagesToRemove.length} images from artwork ${command.artworkId}`,
      );
      return updated;
    } catch (err) {
      this.logger.error(`[${reqId}] remove images failed`, err.stack || err);
      throw err;
    }
  }
}
