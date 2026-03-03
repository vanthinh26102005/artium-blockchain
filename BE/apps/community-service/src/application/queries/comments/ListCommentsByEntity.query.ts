import { CommentableType } from '../../../domain';

export type ListCommentsOptions = {
  skip?: number;
  take?: number;
  includeDeleted?: boolean;
};

export class ListCommentsByEntityQuery {
  constructor(
    public readonly commentableType: CommentableType,
    public readonly commentableId: string,
    public readonly options?: ListCommentsOptions,
  ) {}
}
