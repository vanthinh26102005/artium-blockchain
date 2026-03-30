import { ICommand } from '@nestjs/cqrs';
import { WalletLoginInput } from 'apps/identity-service/src/domain';

export class LoginByWalletCommand implements ICommand {
  constructor(public readonly input: WalletLoginInput) {}
}
