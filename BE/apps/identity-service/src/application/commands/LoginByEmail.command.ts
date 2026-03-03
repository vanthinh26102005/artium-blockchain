import { ICommand } from '@nestjs/cqrs';
import { EmailLoginInput } from '../../domain';

export class LoginByEmailCommand implements ICommand {
  constructor(public readonly loginInput: EmailLoginInput) {}
}
