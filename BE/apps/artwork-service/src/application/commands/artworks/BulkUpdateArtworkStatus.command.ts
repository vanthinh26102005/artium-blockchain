import { ArtworkStatus } from '@app/common';

export class BulkUpdateArtworkStatusCommand {
  constructor(
    public readonly artworkIds: string[],
    public readonly status: ArtworkStatus,
    public readonly sellerId: string,
  ) {}
}
