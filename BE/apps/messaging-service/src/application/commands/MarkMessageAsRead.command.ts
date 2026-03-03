import { ICommand } from '@nestjs/cqrs';

export class MarkMessageAsReadCommand implements ICommand {
  constructor(
    public readonly messageId: string,
    public readonly userId: string,
  ) {}
}
