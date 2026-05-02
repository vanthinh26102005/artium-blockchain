import { ArtworkStatus, RpcExceptionHelper } from '@app/common';
import { Inject, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IArtworkRepository } from '../../../../domain/interfaces/artwork.repository.interface';
import { GetArtworkUploadDraftQuery } from '../GetArtworkUploadDraft.query';

@QueryHandler(GetArtworkUploadDraftQuery)
export class GetArtworkUploadDraftHandler implements IQueryHandler<GetArtworkUploadDraftQuery> {
  private readonly logger = new Logger(GetArtworkUploadDraftHandler.name);

  constructor(
    @Inject(IArtworkRepository) private readonly repo: IArtworkRepository,
  ) {}

  async execute(query: GetArtworkUploadDraftQuery) {
    const artwork = await this.repo.findById(query.draftArtworkId);
    if (
      !artwork ||
      artwork.sellerId !== query.user.id ||
      artwork.status !== ArtworkStatus.DRAFT
    ) {
      throw RpcExceptionHelper.notFound(
        `Artwork draft ${query.draftArtworkId} not found`,
      );
    }

    this.logger.debug(`loaded upload draft id=${query.draftArtworkId}`);
    return artwork;
  }
}
