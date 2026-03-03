import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { DeleteArtworkFolderCommand } from '../DeleteArtworkFolder.command';
import {
  IArtworkFolderRepository,
  IArtworkRepository,
} from 'apps/artwork-service/src/domain';

@CommandHandler(DeleteArtworkFolderCommand)
export class DeleteArtworkFolderHandler implements ICommandHandler<DeleteArtworkFolderCommand> {
  private readonly logger = new Logger(DeleteArtworkFolderHandler.name);

  constructor(
    @Inject(IArtworkFolderRepository)
    private readonly folderRepo: IArtworkFolderRepository,
    @Inject(IArtworkRepository)
    private readonly artworkRepo: IArtworkRepository,
  ) {}

  async execute(command: DeleteArtworkFolderCommand): Promise<boolean> {
    const reqId = `deleteFolder:${Date.now()}`;
    this.logger.log(`[${reqId}] start id=${command.id}`);

    try {
      // First, orphan all artworks in this folder (move to root)
      const artworksInFolder = await this.artworkRepo.findManyByFolderId(
        command.id,
      );

      if (artworksInFolder.length > 0) {
        this.logger.log(
          `[${reqId}] orphaning ${artworksInFolder.length} artworks from folder ${command.id}`,
        );

        // Update all artworks to have null folderId (move to root)
        const artworkIds = artworksInFolder.map((a) => a.id);
        await this.artworkRepo.updateMany(
          { id: { $in: artworkIds } },
          { folderId: null },
        );

        this.logger.log(
          `[${reqId}] orphaned ${artworksInFolder.length} artworks to root`,
        );
      }

      // Then delete the folder
      const ok = await this.folderRepo.delete(command.id);
      this.logger.log(`[${reqId}] deleted=${ok} id=${command.id}`);
      return ok;
    } catch (err) {
      this.logger.error(`[${reqId}] failed id=${command.id}`, err.stack || err);
      throw err;
    }
  }
}
