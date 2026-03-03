import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { BulkDeleteArtworksCommand } from '../BulkDeleteArtworks.command';
import {
  IArtworkRepository,
  GcsStorageService,
} from 'apps/artwork-service/src/domain';

@CommandHandler(BulkDeleteArtworksCommand)
export class BulkDeleteArtworksHandler implements ICommandHandler<BulkDeleteArtworksCommand> {
  private readonly logger = new Logger(BulkDeleteArtworksHandler.name);

  constructor(
    @Inject(IArtworkRepository) private readonly repo: IArtworkRepository,
    private readonly gcsStorage: GcsStorageService,
  ) {}

  async execute(command: BulkDeleteArtworksCommand) {
    const reqId = `bulkDelete:${Date.now()}`;
    this.logger.log(
      `[${reqId}] executing bulk-delete-artworks count=${command.artworkIds.length}`,
    );

    try {
      // Validate artworkIds array
      if (!command.artworkIds || command.artworkIds.length === 0) {
        throw RpcExceptionHelper.badRequest(
          'At least one artwork ID must be provided',
        );
      }

      // Verify all artworks exist and belong to seller
      const artworks = await this.repo.find({
        where: {
          id: { $in: command.artworkIds },
          sellerId: command.sellerId,
        },
      });

      if (artworks.length !== command.artworkIds.length) {
        const foundIds = artworks.map((a) => a.id);
        const missingIds = command.artworkIds.filter(
          (id) => !foundIds.includes(id),
        );
        throw RpcExceptionHelper.notFound(
          `Some artworks not found or do not belong to seller: ${missingIds.join(', ')}`,
        );
      }

      // Collect all images from all artworks and delete from GCS
      const allPublicIds: string[] = [];
      artworks.forEach((artwork) => {
        if (artwork.images && artwork.images.length > 0) {
          const publicIds = artwork.images.map((img) => img.publicId);
          allPublicIds.push(...publicIds);
        }
      });

      if (allPublicIds.length > 0) {
        this.logger.log(
          `[${reqId}] Deleting ${allPublicIds.length} images from GCS`,
        );
        await this.gcsStorage.deleteFiles(allPublicIds);
        this.logger.log(`[${reqId}] Images deleted from GCS`);
      }

      // Perform bulk delete
      const deleted = await this.repo.deleteMany({
        id: { $in: command.artworkIds },
        sellerId: command.sellerId,
      });

      this.logger.log(`[${reqId}] bulk-deleted ${deleted} artworks`);

      return {
        deletedCount: deleted,
        success: true,
      };
    } catch (err) {
      this.logger.error(`[${reqId}] bulk-delete failed`, err.stack || err);
      throw err;
    }
  }
}
