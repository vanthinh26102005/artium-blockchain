export class MoveArtworkFolderCommand {
  constructor(
    public readonly folderId: string,
    public readonly newParentId: string | null,
  ) {}
}
