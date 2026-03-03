import { CreateMomentInput } from '../../../domain';

export class CreateMomentCommand {
  constructor(public readonly input: CreateMomentInput) {}
}
