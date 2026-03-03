import { ICommand } from '@nestjs/cqrs';
import { RequestPasswordResetInput } from '../../domain';

export class RequestPasswordResetCommand implements ICommand {
  constructor(public readonly input: RequestPasswordResetInput) {}
}
