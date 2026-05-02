export class ListArtworkMoodboardIdsForUserQuery {
  constructor(
    public readonly userId: string,
    public readonly artworkId: string,
  ) {}
}
