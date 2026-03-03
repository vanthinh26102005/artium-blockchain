export class GetMessagesInConversationQuery {
  constructor(
    public readonly conversationId: string,
    public readonly userId: string,
    public readonly limit?: number,
    public readonly offset?: number,
  ) {}
}
