import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper, SortDirection } from '@app/common';
import { ReorderFoldersCommand } from '../ReorderFolders.command';
import { IArtworkFolderRepository } from 'apps/artwork-service/src/domain';

@CommandHandler(ReorderFoldersCommand)
export class ReorderFoldersHandler implements ICommandHandler<ReorderFoldersCommand> {
  private readonly logger = new Logger(ReorderFoldersHandler.name);

  constructor(
    @Inject(IArtworkFolderRepository)
    private readonly folderRepo: IArtworkFolderRepository,
  ) {}

  async execute(command: ReorderFoldersCommand) {
    const reqId = `reorderFolders:${Date.now()}`;
    this.logger.log(
      `[${reqId}] reordering ${command.folderIds.length} folders for seller ${command.sellerId}`,
    );

    try {
      if (!command.folderIds || command.folderIds.length === 0) {
        throw RpcExceptionHelper.badRequest(
          'At least one folder ID must be provided',
        );
      }

      const folders = await this.folderRepo.find({
        where: {
          id: { $in: command.folderIds },
          sellerId: command.sellerId,
        },
      });

      if (folders.length !== command.folderIds.length) {
        const foundIds = folders.map((f) => f.id);
        const missingIds = command.folderIds.filter(
          (id) => !foundIds.includes(id),
        );
        throw RpcExceptionHelper.badRequest(
          `Some folders not found or do not belong to seller: ${missingIds.join(', ')}`,
        );
      }

      const updatePromises = command.folderIds.map((folderId, index) =>
        this.folderRepo.update(folderId, { position: index }),
      );

      await Promise.all(updatePromises);

      const updatedFolders = await this.folderRepo.find({
        where: {
          id: { $in: command.folderIds },
        },
        orderBy: { position: SortDirection.ASC },
      });

      this.logger.log(
        `[${reqId}] successfully reordered ${updatedFolders.length} folders`,
      );

      return {
        success: true,
        folders: updatedFolders,
      };
    } catch (err) {
      this.logger.error(`[${reqId}] reorder failed`, err.stack || err);
      throw err;
    }
  }
}
