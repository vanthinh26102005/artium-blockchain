import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { ListArtworkMoodboardIdsForUserQuery } from '../ListArtworkMoodboardIdsForUser.query';
import {
  IMoodboardArtworkRepository,
  IMoodboardRepository,
} from '../../../../domain';

@QueryHandler(ListArtworkMoodboardIdsForUserQuery)
export class ListArtworkMoodboardIdsForUserHandler implements IQueryHandler<
  ListArtworkMoodboardIdsForUserQuery,
  string[]
> {
  private readonly logger = new Logger(
    ListArtworkMoodboardIdsForUserHandler.name,
  );

  constructor(
    @Inject(IMoodboardRepository)
    private readonly moodboardRepository: IMoodboardRepository,
    @Inject(IMoodboardArtworkRepository)
    private readonly moodboardArtworkRepository: IMoodboardArtworkRepository,
  ) {}

  async execute(query: ListArtworkMoodboardIdsForUserQuery): Promise<string[]> {
    if (!query.userId) {
      throw RpcExceptionHelper.badRequest('userId is required');
    }

    if (!query.artworkId) {
      throw RpcExceptionHelper.badRequest('artworkId is required');
    }

    this.logger.debug(
      `Listing user moodboards containing artwork: ${query.artworkId}`,
    );

    const artworkRows = await this.moodboardArtworkRepository.findByArtworkId(
      query.artworkId,
    );
    const moodboardIds = Array.from(
      new Set(artworkRows.map((row) => row.id).filter(Boolean)),
    );

    if (!moodboardIds.length) {
      return [];
    }

    const moodboards = await this.moodboardRepository.find({
      where: { id: { $in: moodboardIds } },
    });

    return moodboards
      .filter((moodboard) => {
        const isOwner = moodboard.userId === query.userId;
        const isCollaborator =
          moodboard.collaboratorIds?.includes(query.userId) ?? false;
        return isOwner || isCollaborator;
      })
      .map((moodboard) => moodboard.id);
  }
}
