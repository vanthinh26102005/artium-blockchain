import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { DeleteArtworkCommand } from '../DeleteArtwork.command';
import {
  IArtworkRepository,
  GcsStorageService,
} from 'apps/artwork-service/src/domain';

@CommandHandler(DeleteArtworkCommand)
export class DeleteArtworkHandler implements ICommandHandler<DeleteArtworkCommand> {
  private readonly logger = new Logger(DeleteArtworkHandler.name);

  constructor(
    @Inject(IArtworkRepository) private readonly repo: IArtworkRepository,
    private readonly gcsStorage: GcsStorageService,
  ) {}

  async execute(command: DeleteArtworkCommand) {
    const reqId = `delete:${Date.now()}`;
    this.logger.log(`[${reqId}] deleting artwork id=${command.id}`);

    try {
      // Get existing artwork to fetch images before deletion
      const existingArtwork = await this.repo.findById(command.id);

      // Delete images from GCS if they exist
      if (
        existingArtwork &&
        existingArtwork.images &&
        existingArtwork.images.length > 0
      ) {
        this.logger.log(
          `[${reqId}] Deleting ${existingArtwork.images.length} images from GCS`,
        );
        const publicIdsToDelete = existingArtwork.images.map(
          (img) => img.publicId,
        );
        await this.gcsStorage.deleteFiles(publicIdsToDelete);
        this.logger.log(`[${reqId}] Images deleted from GCS`);
      }

      // Delete artwork from database
      const ok = await this.repo.delete(command.id);
      this.logger.log(`[${reqId}] delete result id=${command.id} ok=${ok}`);
      return ok;
    } catch (err) {
      this.logger.error(`[${reqId}] delete failed`, err.stack || err);
      throw err;
    }
  }
}
