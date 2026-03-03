import { ICommand } from '@nestjs/cqrs';
import { GoogleLoginInput } from '../../domain';

export class LoginByGoogleCommand implements ICommand {
  constructor(public readonly input: GoogleLoginInput) {}
}
