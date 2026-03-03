import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import {
  IArtworkRepository,
  GcsStorageService,
} from 'apps/artwork-service/src/domain';
import { UpdateArtworkImagesCommand } from '../UpdateArtworkImages.command';

@CommandHandler(UpdateArtworkImagesCommand)
export class UpdateArtworkImagesHandler implements ICommandHandler<UpdateArtworkImagesCommand> {
  private readonly logger = new Logger(UpdateArtworkImagesHandler.name);

  constructor(
    @Inject(IArtworkRepository) private readonly repo: IArtworkRepository,
    private readonly gcsStorage: GcsStorageService,
  ) {}

  async execute(command: UpdateArtworkImagesCommand) {
    const reqId = `updateImages:${Date.now()}`;
    this.logger.log(
      `[${reqId}] updating images for artwork ${command.artworkId}`,
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

      // Delete old images from GCS before replacing
      if (currentImages.length > 0) {
        this.logger.log(
          `[${reqId}] Deleting ${currentImages.length} old images from GCS`,
        );
        const publicIdsToDelete = currentImages.map((img) => img.publicId);
        await this.gcsStorage.deleteFiles(publicIdsToDelete);
        this.logger.log(`[${reqId}] Old images deleted from GCS`);
      }

      // Convert ArtworkImageInput to ArtworkImage format by adding IDs
      const newImages = command.images.map((img, index) => ({
        id: `${Date.now()}-${index}`, // Generate temporary ID
        ...img,
      }));

      // Update artwork with new image set
      const updated = await this.repo.update(command.artworkId, {
        images: newImages,
      });

      this.logger.log(
        `[${reqId}] updated images for artwork ${command.artworkId}, now has ${command.images.length} images`,
      );
      return updated;
    } catch (err) {
      this.logger.error(`[${reqId}] update images failed`, err.stack || err);
      throw err;
    }
  }
}
