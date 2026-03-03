export class DeleteMomentCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
