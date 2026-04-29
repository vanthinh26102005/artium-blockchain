import { ArtworkStatus, RpcExceptionHelper } from '@app/common';
import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Artwork } from '../../../../domain/entities/artworks.entity';
import { IArtworkRepository } from '../../../../domain/interfaces/artwork.repository.interface';
import { SaveArtworkDraftCommand } from '../SaveArtworkDraft.command';

@CommandHandler(SaveArtworkDraftCommand)
export class SaveArtworkDraftHandler
  implements ICommandHandler<SaveArtworkDraftCommand>
{
  private readonly logger = new Logger(SaveArtworkDraftHandler.name);

  constructor(
    @Inject(IArtworkRepository) private readonly repo: IArtworkRepository,
  ) {}

  async execute(command: SaveArtworkDraftCommand) {
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

    const {
      status: _status,
      isPublished: _isPublished,
      tagIds: _tagIds,
      images,
      ...draftData
    } = command.data;
    const updateData: Partial<Artwork> = {
      ...draftData,
      sellerId: existingArtwork.sellerId,
      status: ArtworkStatus.DRAFT,
      isPublished: false,
    };

    if (images !== undefined) {
      updateData.images = images.map((image) => ({
        id: image.publicId,
        ...image,
        createdAt: new Date(),
      }));
    }

    this.logger.debug(`saving upload draft id=${command.draftArtworkId}`);
    const updated = await this.repo.update(command.draftArtworkId, updateData);
    if (!updated) {
      throw RpcExceptionHelper.notFound(
        `Artwork draft ${command.draftArtworkId} not found`,
      );
    }

    return updated;
  }
}
