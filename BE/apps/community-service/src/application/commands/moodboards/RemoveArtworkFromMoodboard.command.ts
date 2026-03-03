export class RemoveArtworkFromMoodboardCommand {
  constructor(
    public readonly userId: string,
    public readonly moodboardId: string,
    public readonly artworkId: string,
  ) {}
}
