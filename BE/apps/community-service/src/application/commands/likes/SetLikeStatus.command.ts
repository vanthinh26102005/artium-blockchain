import { LikeableType } from '../../../domain';

export type SetLikeStatusInput = {
  userId: string;
  likeableType: LikeableType;
  likeableId: string;
  liked: boolean;
  contentOwnerId?: string | null;
};

export type LikeStatusResult = {
  liked: boolean;
  changed: boolean;
};

export class SetLikeStatusCommand {
  constructor(public readonly input: SetLikeStatusInput) {}
}
