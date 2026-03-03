export class ReorderFoldersCommand {
  constructor(
    public readonly sellerId: string,
    public readonly folderIds: string[],
  ) {}
}
