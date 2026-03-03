import { CreateArtworkInput } from 'apps/artwork-service/src/domain';

export class CreateArtworkCommand {
  constructor(public readonly input: CreateArtworkInput) {}
}
