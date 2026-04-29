import { SubmitArtworkDraftInput, UserPayload } from '@app/common';

export class SubmitArtworkDraftCommand {
  constructor(
    public readonly draftArtworkId: string,
    public readonly data: SubmitArtworkDraftInput,
    public readonly user: UserPayload,
  ) {}
}
