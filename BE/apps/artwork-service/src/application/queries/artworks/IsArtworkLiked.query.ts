export class IsArtworkLikedQuery {
  constructor(
    public readonly userId: string,
    public readonly artworkId: string,
  ) {}
}
