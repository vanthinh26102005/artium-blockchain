export class UploadCommunityMoodboardMediaCommand {
  constructor(
    public readonly userId: string,
    public readonly files: Express.Multer.File[],
    public readonly durationSecondsByFileName?: Record<string, number> | string,
  ) {}
}
