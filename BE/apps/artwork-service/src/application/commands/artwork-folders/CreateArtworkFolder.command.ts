import { CreateArtworkFolderInput } from 'apps/artwork-service/src/domain';

export class CreateArtworkFolderCommand {
  constructor(public readonly input: CreateArtworkFolderInput) {}
}
