import { AuthRequestMetadata } from '@app/common';
import { ICommand } from '@nestjs/cqrs';
import { RequestPasswordResetInput } from '../../domain';

export class RequestPasswordResetCommand implements ICommand {
  constructor(
    public readonly input: RequestPasswordResetInput,
    public readonly metadata?: AuthRequestMetadata,
  ) {}
}
