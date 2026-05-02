import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { IArtworkLikeRepository } from '../../../../domain';
import { IsArtworkLikedQuery } from '../IsArtworkLiked.query';

@QueryHandler(IsArtworkLikedQuery)
export class IsArtworkLikedHandler
  implements IQueryHandler<IsArtworkLikedQuery, boolean>
{
  private readonly logger = new Logger(IsArtworkLikedHandler.name);

  constructor(
    @Inject(IArtworkLikeRepository)
    private readonly artworkLikeRepository: IArtworkLikeRepository,
  ) {}

  async execute(query: IsArtworkLikedQuery): Promise<boolean> {
    if (!query.userId) {
      throw RpcExceptionHelper.badRequest('userId is required');
    }

    if (!query.artworkId) {
      throw RpcExceptionHelper.badRequest('artworkId is required');
    }

    this.logger.debug(
      `Checking artwork like status for ${query.artworkId} by ${query.userId}`,
    );

    const like = await this.artworkLikeRepository.findByUserAndArtwork(
      query.userId,
      query.artworkId,
    );

    return Boolean(like);
  }
}
