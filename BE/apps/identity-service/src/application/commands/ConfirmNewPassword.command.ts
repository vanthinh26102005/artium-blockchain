import { AuthRequestMetadata } from '@app/common';
import { ICommand } from '@nestjs/cqrs';
import { ConfirmPasswordResetInput } from '../../domain';

export class ConfirmNewPasswordCommand implements ICommand {
  constructor(
    public readonly input: ConfirmPasswordResetInput,
    public readonly metadata?: AuthRequestMetadata,
  ) {}
}
