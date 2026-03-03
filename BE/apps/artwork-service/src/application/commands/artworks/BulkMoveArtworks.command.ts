export class BulkMoveArtworksCommand {
  constructor(
    public readonly artworkIds: string[],
    public readonly folderId: string | null,
    public readonly sellerId: string,
  ) {}
}
