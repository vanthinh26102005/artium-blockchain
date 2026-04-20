import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { IArtworkRepository } from 'apps/artwork-service/src/domain';
import { CreateArtworkCommand } from '../CreateArtwork.command';

@CommandHandler(CreateArtworkCommand)
export class CreateArtworkHandler implements ICommandHandler<CreateArtworkCommand> {
  private readonly logger = new Logger(CreateArtworkHandler.name);

  constructor(
    @Inject(IArtworkRepository) private readonly repo: IArtworkRepository,
  ) {}

  async execute(command: CreateArtworkCommand) {
    const reqId = `create:${Date.now()}`;
    this.logger.log(`[${reqId}] executing create-artwork`, {
      title: command.input.title,
    });

    try {
      // Process images if provided
      const processedImages = null;
      // if (command.input.images && command.input.images.length > 0) {
      //   this.logger.log(`[${reqId}] processing ${command.input.images.length} images`);
      //   processedImages = command.input.images.map((imageInput, index) =>
      //     this.cloudinaryService.createArtworkImageFromInput(imageInput)
      //   );
      // }

      // Create artwork with processed images
      // Convert undefined to null for nullable fields to match entity expectations
      const artworkData = {
        sellerId: command.input.sellerId,
        creatorName: command.input.creatorName ?? null,
        title: command.input.title,
        description: command.input.description ?? null,
        creationYear: command.input.creationYear ?? null,
        editionRun: command.input.editionRun ?? null,
        dimensions: command.input.dimensions ?? null,
        weight: command.input.weight ?? null,
        materials: command.input.materials ?? null,
        location: command.input.location ?? null,
        price: command.input.price ?? null,
        currency: command.input.currency ?? null,
        quantity: command.input.quantity ?? 1,
        status: command.input.status,
        isPublished: command.input.isPublished,
        images: processedImages,
        folderId: command.input.folderId ?? null,
        folder: null,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        moodboardCount: 0,
        ipfsMetadataHash: command.input.ipfsMetadataHash ?? null,
        reservePrice: command.input.reservePrice ?? null,
        minBidIncrement: command.input.minBidIncrement ?? null,
        auctionDuration: command.input.auctionDuration ?? null,
        onChainAuctionId: command.input.onChainAuctionId ?? null,
      };

      const created = await this.repo.create(artworkData);
      this.logger.log(
        `[${reqId}] created artwork id=${created.id} with ${created.images?.length || 0} images`,
      );
      return created;
    } catch (err) {
      this.logger.error(`[${reqId}] create failed`, err.stack || err);
      throw err;
    }
  }
}
