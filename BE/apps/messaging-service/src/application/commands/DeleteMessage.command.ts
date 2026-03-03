import { ICommand } from '@nestjs/cqrs';

export class DeleteMessageCommand implements ICommand {
  constructor(
    public readonly messageId: string,
    public readonly userId: string, // For authorization check
  ) {}
}
