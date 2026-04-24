export class GetArtworkOrderLocksQuery {
  constructor(
    public readonly sellerId: string,
    public readonly artworkIds: string[],
  ) {}
}
