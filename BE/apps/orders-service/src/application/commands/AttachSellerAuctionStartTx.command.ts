export class AttachSellerAuctionStartTxCommand {
  constructor(
    public readonly attemptId: string,
    public readonly sellerId: string,
    public readonly walletAddress: string,
    public readonly txHash: string,
  ) {}
}
