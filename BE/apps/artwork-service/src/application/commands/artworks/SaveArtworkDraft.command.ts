import { SaveArtworkDraftInput, UserPayload } from '@app/common';

export class SaveArtworkDraftCommand {
  constructor(
    public readonly draftArtworkId: string,
    public readonly data: SaveArtworkDraftInput,
    public readonly user: UserPayload,
  ) {}
}
