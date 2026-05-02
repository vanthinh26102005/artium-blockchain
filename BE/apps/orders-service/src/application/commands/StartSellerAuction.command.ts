import { StartSellerAuctionDto } from '@app/common';

export type StartSellerAuctionCommandData = StartSellerAuctionDto & {
  sellerId: string;
  walletAddress: string;
  artworkTitle: string;
  creatorName?: string | null;
  thumbnailUrl?: string | null;
  ipfsMetadataHash: string;
};

export class StartSellerAuctionCommand {
  constructor(public readonly data: StartSellerAuctionCommandData) {}
}
