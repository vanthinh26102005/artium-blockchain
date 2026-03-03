import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper, ArtworkImage } from '@app/common';
import { IArtworkRepository } from 'apps/artwork-service/src/domain';
import { AddImagesToArtworkCommand } from '../AddImagesToArtwork.command';

@CommandHandler(AddImagesToArtworkCommand)
export class AddImagesToArtworkHandler implements ICommandHandler<AddImagesToArtworkCommand> {
  private readonly logger = new Logger(AddImagesToArtworkHandler.name);

  constructor(
    @Inject(IArtworkRepository) private readonly repo: IArtworkRepository,
  ) {}

  async execute(command: AddImagesToArtworkCommand) {
    const reqId = `addImages:${Date.now()}`;
    this.logger.log(`[${reqId}] adding images to artwork ${command.artworkId}`);

    try {
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

      const newImages: ArtworkImage[] = command.images.map(
        (imageInput, index) => {
          const order = imageInput.order ?? currentImages.length + index;
          const isPrimary =
            imageInput.isPrimary ?? (currentImages.length === 0 && index === 0);

          return {
            id:
              imageInput.publicId.split('/').pop()?.split('.')[0] ||
              Date.now().toString(),
            publicId: imageInput.publicId,
            url: imageInput.url,
            secureUrl: imageInput.secureUrl,
            format: imageInput.format,
            width: imageInput.width,
            height: imageInput.height,
            size: imageInput.size,
            bucket: imageInput.bucket,
            createdAt: new Date(),
            altText: imageInput.altText,
            order,
            isPrimary,
          };
        },
      );

      const updatedImages = [...currentImages, ...newImages];
      const updated = await this.repo.update(command.artworkId, {
        images: updatedImages,
      });

      this.logger.log(
        `[${reqId}] added ${newImages.length} images to artwork ${command.artworkId}`,
      );
      return updated;
    } catch (err) {
      this.logger.error(`[${reqId}] add images failed`, err.stack || err);
      throw err;
    }
  }
}
