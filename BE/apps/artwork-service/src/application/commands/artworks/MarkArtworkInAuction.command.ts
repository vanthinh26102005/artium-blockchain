export class MarkArtworkInAuctionCommand {
  constructor(
    public readonly artworkId: string,
    public readonly sellerId: string,
    public readonly onChainAuctionId: string,
  ) {}
}
