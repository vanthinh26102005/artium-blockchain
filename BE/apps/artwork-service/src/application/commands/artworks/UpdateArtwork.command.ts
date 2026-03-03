import { UpdateArtworkInput } from 'apps/artwork-service/src/domain';

export class UpdateArtworkCommand {
  constructor(
    public readonly id: string,
    public readonly input: UpdateArtworkInput,
  ) {}
}
