import { UpdateMoodboardInput } from '../../../domain';

export class UpdateMoodboardCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly input: UpdateMoodboardInput,
  ) {}
}
