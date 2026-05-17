export class ResetSellerAuctionStartAttemptCommand {
  constructor(
    public readonly attemptId: string,
    public readonly sellerId: string,
  ) {}
}
