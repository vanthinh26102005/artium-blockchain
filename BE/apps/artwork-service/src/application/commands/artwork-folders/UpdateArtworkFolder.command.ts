import { UpdateArtworkFolderInput } from 'apps/artwork-service/src/domain';

export class UpdateArtworkFolderCommand {
  constructor(
    public readonly id: string,
    public readonly input: UpdateArtworkFolderInput,
  ) {}
}
