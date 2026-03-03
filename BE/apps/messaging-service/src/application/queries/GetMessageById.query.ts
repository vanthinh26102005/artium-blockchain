export class GetMessageByIdQuery {
  constructor(
    public readonly messageId: string,
    public readonly userId: string,
  ) {}
}
