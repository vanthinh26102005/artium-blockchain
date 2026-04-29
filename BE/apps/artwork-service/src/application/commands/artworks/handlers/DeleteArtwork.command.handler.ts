import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper, SellerAuctionStartStatus } from '@app/common';
import { DeleteArtworkCommand } from '../DeleteArtwork.command';
import { IArtworkAuctionLifecycleRepository } from '../../../../domain/interfaces/artwork-auction-lifecycle.repository.interface';
import { IArtworkRepository } from '../../../../domain/interfaces/artwork.repository.interface';
import { GcsStorageService } from '../../../../domain/services/gcs-storage.service';

@CommandHandler(DeleteArtworkCommand)
export class DeleteArtworkHandler implements ICommandHandler<DeleteArtworkCommand> {
  private readonly logger = new Logger(DeleteArtworkHandler.name);

  constructor(
    @Inject(IArtworkRepository) private readonly repo: IArtworkRepository,
    @Inject(IArtworkAuctionLifecycleRepository)
    private readonly lifecycleRepo: IArtworkAuctionLifecycleRepository,
    private readonly gcsStorage: GcsStorageService,
  ) {}

  async execute(command: DeleteArtworkCommand) {
    const reqId = `delete:${Date.now()}`;
    this.logger.log(`[${reqId}] deleting artwork id=${command.id}`);

    try {
      // Get existing artwork to fetch images before deletion
      const existingArtwork = await this.repo.findById(command.id);
      if (!existingArtwork) {
        this.logger.warn(`[${reqId}] artwork not found id=${command.id}`);
        throw RpcExceptionHelper.notFound(`Artwork ${command.id} not found`);
      }

      if (!command.user?.id) {
        throw RpcExceptionHelper.forbidden('Authenticated seller is required');
      }

      if (existingArtwork.sellerId !== command.user.id) {
        throw RpcExceptionHelper.forbidden(
          'Artwork does not belong to the authenticated seller',
        );
      }

      const lifecycle = await this.lifecycleRepo.findBySellerAndArtworkId(
        command.user.id,
        command.id,
      );
      if (this.isLifecycleLocked(lifecycle)) {
        throw RpcExceptionHelper.conflict(
          'Artwork is locked by auction lifecycle',
        );
      }

      // Delete images from GCS if they exist
      if (
        existingArtwork &&
        existingArtwork.images &&
        existingArtwork.images.length > 0
      ) {
        this.logger.log(
          `[${reqId}] Deleting ${existingArtwork.images.length} images from GCS`,
        );
        const publicIdsToDelete = existingArtwork.images.map(
          (img) => img.publicId,
        );
        await this.gcsStorage.deleteFiles(publicIdsToDelete);
        this.logger.log(`[${reqId}] Images deleted from GCS`);
      }

      // Delete artwork from database
      const ok = await this.repo.delete(command.id);
      this.logger.log(`[${reqId}] delete result id=${command.id} ok=${ok}`);
      return ok;
    } catch (err) {
      this.logger.error(`[${reqId}] delete failed`, err.stack || err);
      throw err;
    }
  }

  private isLifecycleLocked(
    lifecycle: { status: SellerAuctionStartStatus } | null,
  ): boolean {
    if (!lifecycle) {
      return false;
    }

    return [
      SellerAuctionStartStatus.PENDING_START,
      SellerAuctionStartStatus.AUCTION_ACTIVE,
      SellerAuctionStartStatus.RETRY_AVAILABLE,
      SellerAuctionStartStatus.START_FAILED,
    ].includes(lifecycle.status);
  }
}
