import { ArtworkImageInput } from '@app/common';

export class UpdateArtworkImagesCommand {
  constructor(
    public readonly artworkId: string,
    public readonly images: ArtworkImageInput[],
  ) {}
}
