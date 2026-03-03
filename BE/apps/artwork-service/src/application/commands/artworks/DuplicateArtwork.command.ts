export class DuplicateArtworkCommand {
  constructor(
    public readonly artworkId: string,
    public readonly sellerId: string,
    public readonly title?: string,
  ) {}
}
