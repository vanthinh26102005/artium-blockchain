import { ICommand } from '@nestjs/cqrs';

export class PostMessageCommand implements ICommand {
  constructor(
    public readonly senderId: string,
    public readonly conversationId: string,
    public readonly content?: string,
    public readonly mediaUrl?: string,
  ) {}
}
