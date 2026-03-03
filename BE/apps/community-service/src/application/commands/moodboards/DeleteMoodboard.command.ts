export class DeleteMoodboardCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
