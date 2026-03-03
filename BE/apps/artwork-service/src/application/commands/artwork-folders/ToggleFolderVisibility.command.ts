export class ToggleFolderVisibilityCommand {
  constructor(
    public readonly folderId: string,
    public readonly isHidden: boolean,
    public readonly sellerId: string,
  ) {}
}
