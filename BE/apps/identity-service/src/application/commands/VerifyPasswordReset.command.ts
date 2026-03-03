import { ICommand } from '@nestjs/cqrs';
import { VerifyPasswordResetInput } from '../../domain';

export class VerifyPasswordResetCommand implements ICommand {
  constructor(public readonly input: VerifyPasswordResetInput) {}
}
