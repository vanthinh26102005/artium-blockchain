export class UnfollowUserCommand {
  constructor(
    public readonly followingUserId: string,
    public readonly followedUserId: string,
  ) {}
}
