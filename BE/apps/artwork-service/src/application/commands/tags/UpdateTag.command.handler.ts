export class UpdateTagCommand {
  constructor(
    public readonly id: string,
    public readonly payload: Partial<{ name: string; status: string }>,
  ) {}
}
