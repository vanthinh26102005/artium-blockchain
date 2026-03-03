export class ListUserMoodboardsQuery {
  constructor(
    public readonly userId: string,
    public readonly options?: {
      skip?: number;
      take?: number;
      includePrivate?: boolean;
    },
  ) {}
}
