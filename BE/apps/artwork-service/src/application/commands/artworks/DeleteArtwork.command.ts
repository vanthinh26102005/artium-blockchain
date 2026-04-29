import { UserPayload } from '@app/common';

export class DeleteArtworkCommand {
  constructor(
    public readonly id: string,
    public readonly user?: UserPayload,
  ) {}
}
