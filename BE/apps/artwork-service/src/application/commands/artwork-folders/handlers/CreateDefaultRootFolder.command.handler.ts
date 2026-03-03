import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { CreateDefaultRootFolderCommand } from '../CreateDefaultRootFolder.command';
import { IArtworkFolderRepository } from 'apps/artwork-service/src/domain';

@CommandHandler(CreateDefaultRootFolderCommand)
export class CreateDefaultRootFolderHandler implements ICommandHandler<CreateDefaultRootFolderCommand> {
  private readonly logger = new Logger(CreateDefaultRootFolderHandler.name);
  constructor(
    @Inject(IArtworkFolderRepository)
    private readonly repo: IArtworkFolderRepository,
  ) {}

  async execute(command: CreateDefaultRootFolderCommand) {
    const reqId = `createDefaultFolder:${Date.now()}`;
    this.logger.log(`[${reqId}] start seller=${command.sellerId}`);

    try {
      // attempt to find existing
      const existing = await this.repo.findDefaultRootFolder(command.sellerId);
      if (existing) {
        this.logger.log(
          `[${reqId}] default root already exists id=${existing.id}`,
        );
        return existing;
      }

      const created = await this.repo.createDefaultRootFolder(command.sellerId);
      this.logger.log(`[${reqId}] created defaultRoot id=${created.id}`);
      return created;
    } catch (err) {
      this.logger.error(
        `[${reqId}] failed seller=${command.sellerId}`,
        err.stack || err,
      );
      throw err;
    }
  }
}
