import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { BulkUpdateArtworkStatusCommand } from '../BulkUpdateArtworkStatus.command';
import { IArtworkRepository } from 'apps/artwork-service/src/domain';

@CommandHandler(BulkUpdateArtworkStatusCommand)
export class BulkUpdateArtworkStatusHandler implements ICommandHandler<BulkUpdateArtworkStatusCommand> {
  private readonly logger = new Logger(BulkUpdateArtworkStatusHandler.name);

  constructor(
    @Inject(IArtworkRepository) private readonly repo: IArtworkRepository,
  ) {}

  async execute(command: BulkUpdateArtworkStatusCommand) {
    const reqId = `bulkUpdateStatus:${Date.now()}`;
    this.logger.log(
      `[${reqId}] executing bulk-update-status count=${command.artworkIds.length} status=${command.status}`,
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

      // Perform bulk status update using repository method
      const updated = await this.repo.updateStatus(
        command.artworkIds,
        command.status,
      );

      this.logger.log(
        `[${reqId}] bulk-updated ${updated} artworks to status=${command.status}`,
      );

      // Fetch and return updated artworks
      const updatedArtworks = await this.repo.find({
        where: {
          id: { $in: command.artworkIds },
        },
      });

      return {
        updatedCount: updated,
        artworks: updatedArtworks,
      };
    } catch (err) {
      this.logger.error(
        `[${reqId}] bulk-update-status failed`,
        err.stack || err,
      );
      throw err;
    }
  }
}
