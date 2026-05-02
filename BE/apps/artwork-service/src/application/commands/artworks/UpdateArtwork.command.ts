import { UserPayload } from '@app/common';
import { UpdateArtworkInput } from '../../../domain';

export class UpdateArtworkCommand {
  constructor(
    public readonly id: string,
    public readonly input: UpdateArtworkInput,
    public readonly user?: UserPayload,
  ) {}
}
