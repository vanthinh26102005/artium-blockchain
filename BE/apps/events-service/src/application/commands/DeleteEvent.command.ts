export class DeleteEventCommand {
  constructor(
    public readonly eventId: string,
    public readonly userId: string,
  ) {}
}
