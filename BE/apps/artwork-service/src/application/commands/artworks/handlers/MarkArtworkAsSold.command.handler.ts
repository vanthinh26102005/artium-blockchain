import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { MarkArtworkAsSoldCommand } from '../MarkArtworkAsSold.command';
import { IArtworkRepository } from 'apps/artwork-service/src/domain';

@CommandHandler(MarkArtworkAsSoldCommand)
export class MarkArtworkAsSoldHandler implements ICommandHandler<MarkArtworkAsSoldCommand> {
  private readonly logger = new Logger(MarkArtworkAsSoldHandler.name);

  constructor(
    @Inject(IArtworkRepository) private readonly repo: IArtworkRepository,
  ) {}

  async execute(command: MarkArtworkAsSoldCommand) {
    const reqId = `sold:${Date.now()}`;
    this.logger.log(
      `[${reqId}] mark as sold id=${command.id} qty=${command.quantity}`,
    );

    try {
      const updated = await this.repo.markAsSold(command.id, command.quantity);
      if (!updated) {
        this.logger.warn(`[${reqId}] artwork not found id=${command.id}`);
        throw RpcExceptionHelper.notFound(`Artwork ${command.id} not found`);
      }
      this.logger.log(`[${reqId}] marked as sold id=${command.id}`);
      return updated;
    } catch (err) {
      this.logger.error(`[${reqId}] markAsSold failed`, err.stack || err);
      throw err;
    }
  }
}
