import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { BulkMoveArtworksCommand } from '../BulkMoveArtworks.command';
import {
  IArtworkRepository,
  IArtworkFolderRepository,
} from 'apps/artwork-service/src/domain';

@CommandHandler(BulkMoveArtworksCommand)
export class BulkMoveArtworksHandler implements ICommandHandler<BulkMoveArtworksCommand> {
  private readonly logger = new Logger(BulkMoveArtworksHandler.name);

  constructor(
    @Inject(IArtworkRepository)
    private readonly artworkRepo: IArtworkRepository,
    @Inject(IArtworkFolderRepository)
    private readonly folderRepo: IArtworkFolderRepository,
  ) {}

  async execute(command: BulkMoveArtworksCommand) {
    const reqId = `bulkMove:${Date.now()}`;
    this.logger.log(
      `[${reqId}] executing bulk-move-artworks count=${command.artworkIds.length} to folderId=${command.folderId || 'root'} `,
    );

    try {
      // Validate artworkIds array
      if (!command.artworkIds || command.artworkIds.length === 0) {
        throw RpcExceptionHelper.badRequest(
          'At least one artwork ID must be provided',
        );
      }

      // If moving to a folder (not root), verify folder exists and belongs to seller
      if (command.folderId !== null) {
        const folder = await this.folderRepo.findById(command.folderId);
        if (!folder) {
          this.logger.warn(
            `[${reqId}] folder not found id=${command.folderId}`,
          );
          throw RpcExceptionHelper.notFound(
            `Folder ${command.folderId} not found`,
          );
        }

        if (folder.sellerId !== command.sellerId) {
          throw RpcExceptionHelper.badRequest(
            'Folder does not belong to the specified seller',
          );
        }
      }

      // Verify all artworks exist and belong to seller
      const artworks = await this.artworkRepo.find({
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

      // Perform bulk update
      const updated = await this.artworkRepo.updateMany(
        { id: { $in: command.artworkIds }, sellerId: command.sellerId },
        { folderId: command.folderId },
      );

      this.logger.log(
        `[${reqId}] bulk-moved ${updated} artworks to folderId=${command.folderId || 'root'} `,
      );

      // Fetch and return updated artworks
      const updatedArtworks = await this.artworkRepo.find({
        where: {
          id: { $in: command.artworkIds },
        },
      });

      return {
        movedCount: updated,
        artworks: updatedArtworks,
      };
    } catch (err) {
      this.logger.error(`[${reqId}] bulk-move failed`, err.stack || err);
      throw err;
    }
  }
}
