import { UserPayload } from '@app/common';

export class GetArtworkUploadDraftQuery {
  constructor(
    public readonly draftArtworkId: string,
    public readonly user: UserPayload,
  ) {}
}
