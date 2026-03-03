import { ArtworkImageInput } from '@app/common';

export class AddImagesToArtworkCommand {
  constructor(
    public readonly artworkId: string,
    public readonly images: ArtworkImageInput[],
  ) {}
}
