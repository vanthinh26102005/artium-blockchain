export class ListTagsQuery {
  constructor(
    public readonly params?: {
      sellerId?: string;
      status?: string;
      skip?: number;
      take?: number;
    },
  ) {}
}
