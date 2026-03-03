export class GetConversationByIdQuery {
  constructor(
    public readonly conversationId: string,
    public readonly userId: string,
  ) {}
}
