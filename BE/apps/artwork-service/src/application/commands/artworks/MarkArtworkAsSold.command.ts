export class MarkArtworkAsSoldCommand {
  constructor(
    public readonly id: string,
    public readonly quantity = 1,
  ) {}
}
