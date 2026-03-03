import { ICommand } from '@nestjs/cqrs';
import { CompleteUserRegisterInput, User } from '../../domain';

export interface CompleteUserRegistrationResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export class CompleteUserRegistrationCommand implements ICommand {
  constructor(public readonly input: CompleteUserRegisterInput) {}
}
