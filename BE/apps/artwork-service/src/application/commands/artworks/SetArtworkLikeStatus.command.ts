export type SetArtworkLikeStatusInput = {
  userId: string;
  artworkId: string;
  liked: boolean;
};

export type ArtworkLikeStatusResult = {
  liked: boolean;
  changed: boolean;
  likeCount: number;
};

export class SetArtworkLikeStatusCommand {
  constructor(public readonly input: SetArtworkLikeStatusInput) {}
}
