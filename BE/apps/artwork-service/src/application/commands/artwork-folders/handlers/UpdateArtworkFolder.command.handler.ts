import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import { UpdateArtworkFolderCommand } from '../UpdateArtworkFolder.command';
import {
  ArtworkFolder,
  IArtworkFolderRepository,
} from 'apps/artwork-service/src/domain';

@CommandHandler(UpdateArtworkFolderCommand)
export class UpdateArtworkFolderHandler implements ICommandHandler<UpdateArtworkFolderCommand> {
  private readonly logger = new Logger(UpdateArtworkFolderHandler.name);

  constructor(
    @Inject(IArtworkFolderRepository)
    private readonly repo: IArtworkFolderRepository,
  ) {}

  async execute(command: UpdateArtworkFolderCommand): Promise<ArtworkFolder> {
    const reqId = `updateFolder:${Date.now()}`;
    const { id, input } = command;

    this.logger.log(`[${reqId}] Start updating folder id=${id}`, { input });

    if (!id) {
      throw RpcExceptionHelper.badRequest('Folder ID is required.');
    }
    if (!input || Object.keys(input).length === 0) {
      throw RpcExceptionHelper.badRequest('No fields provided for update.');
    }

    try {
      const existing = await this.repo.findById(id);
      if (!existing) {
        this.logger.warn(`[${reqId}] Folder not found id=${id}`);
        throw RpcExceptionHelper.notFound(`Folder with id=${id} not found.`);
      }

      const updateData: Partial<ArtworkFolder> = {
        name: input.name ?? existing.name,
        parentId:
          input.parentId === undefined ? existing.parentId : input.parentId,
      };

      const updated = await this.repo.update(id, updateData);

      if (!updated) {
        this.logger.error(`[${reqId}] Update returned null for id=${id}`);
        throw RpcExceptionHelper.internalError(
          'Failed to update artwork folder.',
        );
      }

      this.logger.log(`[${reqId}] Successfully updated folder id=${id}`);
      return updated;
    } catch (err) {
      this.logger.error(
        `[${reqId}] Failed to update folder id=${id}`,
        err.stack || err,
      );

      if (err instanceof RpcException) throw err;
      throw RpcExceptionHelper.internalError(
        'Unexpected error while updating artwork folder.',
      );
    }
  }
}
