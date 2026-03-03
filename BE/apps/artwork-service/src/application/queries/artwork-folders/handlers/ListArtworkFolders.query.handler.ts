import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { SortDirection } from '@app/common';
import { ListArtworkFoldersQuery } from '../ListArtworkFolders.query';
import {
  IArtworkFolderRepository,
  IArtworkRepository,
} from 'apps/artwork-service/src/domain';

@QueryHandler(ListArtworkFoldersQuery)
export class ListArtworkFoldersHandler implements IQueryHandler<ListArtworkFoldersQuery> {
  private readonly logger = new Logger(ListArtworkFoldersHandler.name);

  constructor(
    @Inject(IArtworkFolderRepository)
    private readonly folderRepo: IArtworkFolderRepository,
    @Inject(IArtworkRepository)
    private readonly artworkRepo: IArtworkRepository,
  ) {}

  async execute(query: ListArtworkFoldersQuery) {
    const reqId = `listFolders:${Date.now()}`;
    this.logger.debug(
      `[${reqId}] start options=`,
      query.options,
      `includeCounts=${query.includeCounts}`,
    );

    // Build where clause from options (sellerId, parentId)
    const where: Record<string, any> = {};
    if (query.options?.sellerId) {
      where.sellerId = query.options.sellerId;
    }
    if (query.options?.parentId) {
      where.parentId = query.options.parentId;
    }

    const folders = await this.folderRepo.find({
      where,
      orderBy: { position: SortDirection.ASC },
    });

    // If includeCounts is requested, add itemCount to each folder
    if (query.includeCounts && folders.length > 0) {
      // Get sellerId from query options or first folder
      const sellerId = query.options?.sellerId || folders[0]?.sellerId;

      if (sellerId) {
        // Fetch all artworks for this seller to count by folder
        const artworks = await this.artworkRepo.findManyBySellerId(sellerId);

        // Count artworks per folder
        const counts = new Map<string, number>();
        artworks.forEach((artwork) => {
          if (artwork.folderId) {
            counts.set(
              artwork.folderId,
              (counts.get(artwork.folderId) || 0) + 1,
            );
          }
        });

        // Add counts to folders
        const foldersWithCounts = folders.map((folder) => ({
          ...folder,
          itemCount: counts.get(folder.id) || 0,
        }));

        this.logger.debug(
          `[${reqId}] returned=${foldersWithCounts.length} folders with counts`,
        );
        return foldersWithCounts;
      }
    }

    this.logger.debug(`[${reqId}] returned=${folders.length} folders`);
    return folders;
  }
}
