import { ICommand } from '@nestjs/cqrs';

export class CreateConversationCommand implements ICommand {
  constructor(
    public readonly creatorId: string,
    public readonly memberIds: string[],
  ) {}
}
