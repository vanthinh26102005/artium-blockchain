import { ICommand } from '@nestjs/cqrs';

export class UnlinkWalletCommand implements ICommand {
  constructor(public readonly userId: string) {}
}
