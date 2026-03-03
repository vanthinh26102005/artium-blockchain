export class ListUserMomentsQuery {
  constructor(
    public readonly userId: string,
    public readonly options?: {
      skip?: number;
      take?: number;
      includeArchived?: boolean;
    },
  ) {}
}
