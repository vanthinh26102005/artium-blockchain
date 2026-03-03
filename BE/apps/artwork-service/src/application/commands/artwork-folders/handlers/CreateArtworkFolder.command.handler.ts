import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { CreateArtworkFolderCommand } from '../CreateArtworkFolder.command';
import {
  ArtworkFolder,
  IArtworkFolderRepository,
} from 'apps/artwork-service/src/domain';

@CommandHandler(CreateArtworkFolderCommand)
export class CreateArtworkFolderHandler implements ICommandHandler<CreateArtworkFolderCommand> {
  private readonly logger = new Logger(CreateArtworkFolderHandler.name);

  constructor(
    @Inject(IArtworkFolderRepository)
    private readonly repo: IArtworkFolderRepository,
  ) {}

  async execute(command: CreateArtworkFolderCommand): Promise<ArtworkFolder> {
    const reqId = `createFolder:${Date.now()}`;
    this.logger.log(`[${reqId}] start`, { input: command.input });

    const { sellerId, name, parentId } = command.input;

    if (!sellerId || !name?.trim()) {
      throw RpcExceptionHelper.badRequest('sellerId and name are required.');
    }

    try {
      const newFolder: Omit<ArtworkFolder, 'id' | 'createdAt'> = {
        sellerId,
        name: name.trim(),
        position: 0,
        isHidden: false,
        parentId: parentId || null,
        parent: null,
        children: [],
        artworks: [],
      };

      const created = await this.repo.create(newFolder);
      this.logger.log(`[${reqId}] successfully created folder`, {
        folderId: created.id,
      });
      return created;
    } catch (err) {
      this.logger.error(`[${reqId}] failed to create folder`, err.stack || err);
      throw RpcExceptionHelper.internalError('Failed to create artwork folder');
    }
  }
}
