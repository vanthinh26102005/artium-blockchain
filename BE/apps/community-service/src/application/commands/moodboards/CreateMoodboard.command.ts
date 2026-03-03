import { CreateMoodboardInput } from '../../../domain';

export class CreateMoodboardCommand {
  constructor(public readonly input: CreateMoodboardInput) {}
}
