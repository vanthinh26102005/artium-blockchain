export class UploadCommunityMomentMediaCommand {
  constructor(
    public readonly userId: string,
    public readonly file: Express.Multer.File,
    public readonly durationSeconds?: number,
  ) {}
}
