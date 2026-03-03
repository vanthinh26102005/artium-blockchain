import { ICommand } from '@nestjs/cqrs';

export class UpdateMessageCommand implements ICommand {
  constructor(
    public readonly messageId: string,
    public readonly userId: string,
    public readonly content?: string,
    public readonly mediaUrl?: string,
  ) {}
}
