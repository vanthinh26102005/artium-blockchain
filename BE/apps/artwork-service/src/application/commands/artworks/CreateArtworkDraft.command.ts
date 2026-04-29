import { CreateArtworkDraftInput, UserPayload } from '@app/common';

export class CreateArtworkDraftCommand {
  constructor(
    public readonly draftArtworkId: string,
    public readonly data: CreateArtworkDraftInput,
    public readonly user: UserPayload,
  ) {}
}
