export class GetFollowersQuery {
  constructor(
    public readonly userId: string,
    public readonly options?: {
      skip?: number;
      take?: number;
    },
  ) {}
}
