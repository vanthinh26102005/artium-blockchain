import { ICommand } from '@nestjs/cqrs';
import { UpdateUserInput, User } from '../../domain';

export interface UpdateUserProfileResult {
  user: Omit<User, 'password'>;
}

export class UpdateUserProfileCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly input: UpdateUserInput,
  ) {}
}
