import { ArtworkStatus, RpcExceptionHelper } from '@app/common';
import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IArtworkRepository } from '../../../../domain/interfaces/artwork.repository.interface';
import { CreateArtworkDraftCommand } from '../CreateArtworkDraft.command';

@CommandHandler(CreateArtworkDraftCommand)
export class CreateArtworkDraftHandler implements ICommandHandler<CreateArtworkDraftCommand> {
  private readonly logger = new Logger(CreateArtworkDraftHandler.name);

  constructor(
    @Inject(IArtworkRepository) private readonly repo: IArtworkRepository,
  ) {}

  async execute(command: CreateArtworkDraftCommand) {
    const userId = command.user?.id;
    if (!userId) {
      throw RpcExceptionHelper.unauthorized('Authenticated user is required');
    }

    const existingArtwork = await this.repo.findById(command.draftArtworkId);
    if (existingArtwork) {
      if (
        existingArtwork.sellerId !== userId ||
        existingArtwork.status !== ArtworkStatus.DRAFT
      ) {
        throw RpcExceptionHelper.notFound(
          `Artwork draft ${command.draftArtworkId} not found`,
        );
      }

      return existingArtwork;
    }

    this.logger.log(`creating upload draft id=${command.draftArtworkId}`);
    return this.repo.create({
      id: command.draftArtworkId,
      sellerId: userId,
      creatorName: null,
      title: 'Untitled draft',
      description: null,
      creationYear: null,
      editionRun: null,
      dimensions: null,
      weight: null,
      materials: null,
      location: null,
      price: null,
      currency: null,
      quantity: 1,
      status: ArtworkStatus.DRAFT,
      isPublished: false,
      images: null,
      folderId: null,
      folder: null,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      moodboardCount: 0,
      ipfsMetadataHash: null,
      reservePrice: null,
      minBidIncrement: null,
      auctionDuration: null,
      onChainAuctionId: null,
    } as Parameters<IArtworkRepository['create']>[0] & { id: string });
  }
}
