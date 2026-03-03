import { AddArtworkToMoodboardInput } from '../../../domain';

export class AddArtworkToMoodboardCommand {
  constructor(
    public readonly userId: string,
    public readonly input: AddArtworkToMoodboardInput,
  ) {}
}
