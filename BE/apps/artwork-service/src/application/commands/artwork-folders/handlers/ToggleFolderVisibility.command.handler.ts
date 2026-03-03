import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { ToggleFolderVisibilityCommand } from '../ToggleFolderVisibility.command';
import { IArtworkFolderRepository } from 'apps/artwork-service/src/domain';

@CommandHandler(ToggleFolderVisibilityCommand)
export class ToggleFolderVisibilityHandler implements ICommandHandler<ToggleFolderVisibilityCommand> {
  private readonly logger = new Logger(ToggleFolderVisibilityHandler.name);

  constructor(
    @Inject(IArtworkFolderRepository)
    private readonly folderRepo: IArtworkFolderRepository,
  ) {}

  async execute(command: ToggleFolderVisibilityCommand) {
    const reqId = `toggleVisibility:${Date.now()}`;
    this.logger.log(
      `[${reqId}] toggling folder visibility folderId=${command.folderId} isHidden=${command.isHidden}`,
    );

    try {
      const folder = await this.folderRepo.findById(command.folderId);

      if (!folder) {
        this.logger.warn(`[${reqId}] folder not found id=${command.folderId}`);
        throw RpcExceptionHelper.notFound(
          `Folder ${command.folderId} not found`,
        );
      }

      if (folder.sellerId !== command.sellerId) {
        throw RpcExceptionHelper.badRequest(
          'Folder does not belong to the specified seller',
        );
      }

      await this.folderRepo.update(command.folderId, {
        isHidden: command.isHidden,
      });

      const updatedFolder = await this.folderRepo.findById(command.folderId);

      this.logger.log(
        `[${reqId}] successfully toggled folder visibility to isHidden=${command.isHidden}`,
      );

      return {
        folder: updatedFolder,
      };
    } catch (err) {
      this.logger.error(
        `[${reqId}] toggle visibility failed`,
        err.stack || err,
      );
      throw err;
    }
  }
}
