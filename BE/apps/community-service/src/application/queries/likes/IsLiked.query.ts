import { LikeableType } from '../../../domain';

export class IsLikedQuery {
  constructor(
    public readonly userId: string,
    public readonly likeableType: LikeableType,
    public readonly likeableId: string,
  ) {}
}
