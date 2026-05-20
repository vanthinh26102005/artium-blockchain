import { ICommand } from '@nestjs/cqrs';
import { WalletLoginInput } from 'apps/identity-service/src/domain';

export class LinkWalletCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly input: WalletLoginInput,
  ) {}
}
