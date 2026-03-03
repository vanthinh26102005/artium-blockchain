import { UpdateMomentInput } from '../../../domain';

export class UpdateMomentCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly input: UpdateMomentInput,
  ) {}
}
