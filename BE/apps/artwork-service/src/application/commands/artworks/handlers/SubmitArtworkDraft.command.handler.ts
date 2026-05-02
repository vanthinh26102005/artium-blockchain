import { ArtworkStatus, RpcExceptionHelper } from '@app/common';
import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Artwork } from '../../../../domain/entities/artworks.entity';
import { IArtworkRepository } from '../../../../domain/interfaces/artwork.repository.interface';
import { SubmitArtworkDraftCommand } from '../SubmitArtworkDraft.command';

@CommandHandler(SubmitArtworkDraftCommand)
export class SubmitArtworkDraftHandler implements ICommandHandler<SubmitArtworkDraftCommand> {
  private readonly logger = new Logger(SubmitArtworkDraftHandler.name);

  constructor(
    @Inject(IArtworkRepository) private readonly repo: IArtworkRepository,
  ) {}

  async execute(command: SubmitArtworkDraftCommand) {
    const existingArtwork = await this.repo.findById(command.draftArtworkId);
    if (!existingArtwork) {
      throw RpcExceptionHelper.notFound(
        `Artwork draft ${command.draftArtworkId} not found`,
      );
    }

    if (existingArtwork.sellerId !== command.user.id) {
      throw RpcExceptionHelper.notFound(
        `Artwork draft ${command.draftArtworkId} not found`,
      );
    }

    if (existingArtwork.status !== ArtworkStatus.DRAFT) {
      throw RpcExceptionHelper.notFound(
        `Artwork draft ${command.draftArtworkId} not found`,
      );
    }

    this.validateDraft(existingArtwork, command);

    const { status, isPublished } = this.resolveLifecycle(command);
    const updated = await this.repo.update(command.draftArtworkId, {
      status,
      isPublished,
      price: command.data.price ?? existingArtwork.price,
      quantity: command.data.quantity ?? existingArtwork.quantity,
      sellerId: existingArtwork.sellerId,
    });

    if (!updated) {
      throw RpcExceptionHelper.notFound(
        `Artwork draft ${command.draftArtworkId} not found`,
      );
    }

    this.logger.log(`submitted upload draft id=${command.draftArtworkId}`);
    return updated;
  }

  private validateDraft(
    existingArtwork: Artwork,
    command: SubmitArtworkDraftCommand,
  ) {
    if (!existingArtwork.title?.trim()) {
      throw RpcExceptionHelper.badRequest('Artwork title is required');
    }

    if (
      existingArtwork.creationYear !== null &&
      (!Number.isInteger(existingArtwork.creationYear) ||
        existingArtwork.creationYear <= 0)
    ) {
      throw RpcExceptionHelper.badRequest('Artwork creation year is invalid');
    }

    if (existingArtwork.dimensions) {
      const { height, width } = existingArtwork.dimensions;
      if (
        typeof height !== 'number' ||
        height <= 0 ||
        typeof width !== 'number' ||
        width <= 0
      ) {
        throw RpcExceptionHelper.badRequest(
          'Artwork dimensions must include positive height and width',
        );
      }
    }

    if (command.data.listingStatus === 'sale') {
      const price = command.data.price ?? existingArtwork.price;
      const quantity = command.data.quantity ?? existingArtwork.quantity;
      if (!price || Number.parseFloat(price) <= 0) {
        throw RpcExceptionHelper.badRequest('Sale drafts require a price');
      }
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw RpcExceptionHelper.badRequest(
          'Sale drafts require quantity of at least 1',
        );
      }
    }

    const hasPrimaryImage = existingArtwork.images?.some(
      (image) => image.isPrimary === true,
    );
    if (!hasPrimaryImage) {
      throw RpcExceptionHelper.badRequest(
        'Artwork draft requires a primary image before submission',
      );
    }
  }

  private resolveLifecycle(command: SubmitArtworkDraftCommand) {
    if (command.data.listingStatus === 'sale') {
      return { status: ArtworkStatus.ACTIVE, isPublished: true };
    }

    if (command.data.listingStatus === 'sold') {
      return { status: ArtworkStatus.SOLD, isPublished: false };
    }

    return { status: ArtworkStatus.INACTIVE, isPublished: false };
  }
}
