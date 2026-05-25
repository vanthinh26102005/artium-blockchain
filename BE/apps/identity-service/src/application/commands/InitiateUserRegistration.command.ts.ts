import { AuthRequestMetadata } from '@app/common';
import { ICommand } from '@nestjs/cqrs';
import { UserRegisterInput } from '../../domain';

export class InitiateUserRegistrationCommand implements ICommand {
  constructor(
    public readonly input: UserRegisterInput,
    public readonly metadata?: AuthRequestMetadata,
  ) {}
}
