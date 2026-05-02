import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper, SellerAuctionStartStatus } from '@app/common';
import { UpdateArtworkCommand } from '../UpdateArtwork.command';
import { IArtworkAuctionLifecycleRepository } from '../../../../domain/interfaces/artwork-auction-lifecycle.repository.interface';
import { IArtworkRepository } from '../../../../domain/interfaces/artwork.repository.interface';

@CommandHandler(UpdateArtworkCommand)
export class UpdateArtworkHandler implements ICommandHandler<UpdateArtworkCommand> {
  private readonly logger = new Logger(UpdateArtworkHandler.name);

  constructor(
    @Inject(IArtworkRepository) private readonly repo: IArtworkRepository,
    @Inject(IArtworkAuctionLifecycleRepository)
    private readonly lifecycleRepo: IArtworkAuctionLifecycleRepository,
  ) {}

  async execute(command: UpdateArtworkCommand) {
    const reqId = `update:${Date.now()}`;
    this.logger.log(`[${reqId}] executing update-artwork id=${command.id}`);

    try {
      // Get existing artwork first to verify it exists
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

      // Update artwork with new data (exclude images - use separate image handlers)
      const { images, ...updateData } = command.input;
      const updated = await this.repo.update(command.id, updateData);
      this.logger.log(`[${reqId}] updated artwork id=${command.id}`);
      return updated;
    } catch (err) {
      this.logger.error(`[${reqId}] update failed`, err.stack || err);
      throw err;
    }
  }

  private isLifecycleLocked(
    lifecycle: {
      status: SellerAuctionStartStatus;
      editAllowed?: boolean;
    } | null,
  ): boolean {
    if (!lifecycle) {
      return false;
    }

    if (lifecycle.status === SellerAuctionStartStatus.START_FAILED) {
      return lifecycle.editAllowed !== true;
    }

    return [
      SellerAuctionStartStatus.PENDING_START,
      SellerAuctionStartStatus.AUCTION_ACTIVE,
      SellerAuctionStartStatus.RETRY_AVAILABLE,
    ].includes(lifecycle.status);
  }
}
