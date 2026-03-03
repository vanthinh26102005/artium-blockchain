export class RemoveImagesFromArtworkCommand {
  constructor(
    public readonly artworkId: string,
    public readonly imageIds: string[],
  ) {}
}
