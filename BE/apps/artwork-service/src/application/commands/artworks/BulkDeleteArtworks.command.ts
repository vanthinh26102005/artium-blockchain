export class BulkDeleteArtworksCommand {
  constructor(
    public readonly artworkIds: string[],
    public readonly sellerId: string,
  ) {}
}
