import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ArtworkStatus, RpcExceptionHelper } from '@app/common';
import { IArtworkRepository } from '../../../../domain/interfaces/artwork.repository.interface';
import { MarkArtworkInAuctionCommand } from '../MarkArtworkInAuction.command';

@CommandHandler(MarkArtworkInAuctionCommand)
export class MarkArtworkInAuctionHandler implements ICommandHandler<MarkArtworkInAuctionCommand> {
  private readonly logger = new Logger(MarkArtworkInAuctionHandler.name);

  constructor(
    @Inject(IArtworkRepository) private readonly repo: IArtworkRepository,
  ) {}

  async execute(command: MarkArtworkInAuctionCommand) {
    const reqId = `markArtworkInAuction:${command.artworkId}:${command.onChainAuctionId}`;
    this.logger.log(
      `[${reqId}] promoting artwork into authoritative in-auction state`,
    );

    const artwork = await this.repo.findById(command.artworkId);
    if (!artwork) {
      throw RpcExceptionHelper.notFound('Artwork not found');
    }
    if (artwork.sellerId !== command.sellerId) {
      throw RpcExceptionHelper.conflict(
        'Artwork does not belong to the seller tied to this auction start',
      );
    }
    if (
      artwork.onChainAuctionId &&
      artwork.onChainAuctionId !== command.onChainAuctionId
    ) {
      throw RpcExceptionHelper.conflict(
        'Artwork is already linked to a different on-chain auction',
      );
    }
    if (
      artwork.status === ArtworkStatus.IN_AUCTION &&
      artwork.onChainAuctionId === command.onChainAuctionId
    ) {
      return artwork;
    }

    const updated = await this.repo.update(command.artworkId, {
      status: ArtworkStatus.IN_AUCTION,
      onChainAuctionId: command.onChainAuctionId,
    });
    if (!updated) {
      throw RpcExceptionHelper.internalError(
        'Failed to update artwork auction projection',
      );
    }

    return updated;
  }
}
