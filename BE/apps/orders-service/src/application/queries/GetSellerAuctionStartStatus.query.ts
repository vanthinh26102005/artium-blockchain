export class GetSellerAuctionStartStatusQuery {
  constructor(
    public readonly sellerId: string,
    public readonly artworkId: string,
  ) {}
}
