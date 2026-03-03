import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { UpdateArtworkCommand } from '../UpdateArtwork.command';
import { IArtworkRepository } from 'apps/artwork-service/src/domain';

@CommandHandler(UpdateArtworkCommand)
export class UpdateArtworkHandler implements ICommandHandler<UpdateArtworkCommand> {
  private readonly logger = new Logger(UpdateArtworkHandler.name);

  constructor(
    @Inject(IArtworkRepository) private readonly repo: IArtworkRepository,
  ) {}

  async execute(command: UpdateArtworkCommand) {
    const reqId = `update:${Date.now()}`;
    this.logger.log(`[${reqId}] executing update-artwork id=${command.id}`);

    try {
      // Get existing artwork first to verify it exists
      const existingArtwork = await this.repo.findById(command.id);
      if (!existingArtwork) {
        this.logger.warn(`[${reqId}] artwork not found id=${command.id}`);
        throw RpcExceptionHelper.notFound(`Artwork ${command.id} not found`);
      }

      // Update artwork with new data (exclude images - use separate image handlers)
      const { images, ...updateData } = command.input;
      const updated = await this.repo.update(command.id, updateData);
      this.logger.log(`[${reqId}] updated artwork id=${command.id}`);
      return updated;
    } catch (err) {
      this.logger.error(`[${reqId}] update failed`, err.stack || err);
      throw err;
    }
  }
}
