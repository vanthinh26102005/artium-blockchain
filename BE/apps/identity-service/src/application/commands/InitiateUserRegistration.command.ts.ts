import { ICommand } from '@nestjs/cqrs';
import { UserRegisterInput } from '../../domain';

export class InitiateUserRegistrationCommand implements ICommand {
  constructor(public readonly input: UserRegisterInput) {}
}
