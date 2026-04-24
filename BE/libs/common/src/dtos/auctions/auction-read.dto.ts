import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AuctionStatusKey {
  ACTIVE = 'active',
  ENDING_SOON = 'ending-soon',
  NEWLY_LISTED = 'newly-listed',
  PAUSED = 'paused',
  CLOSED = 'closed',
}

export enum AuctionCategoryKey {
  ARCHITECTURAL = 'architectural',
  SCULPTURE = 'sculpture',
  DIGITAL = 'digital',
  INSTALLATION = 'installation',
}

export class AuctionArtworkDisplayObject {
  @ApiProperty({ description: 'Artwork UUID or stable display identifier' })
  artworkId!: string;

  @ApiProperty({ description: 'Artwork title displayed on auction cards' })
  title!: string;

  @ApiProperty({ description: 'Artist, seller, or creator display name' })
  creatorName!: string;

  @ApiProperty({ description: 'Primary artwork image URL for the auction card' })
  imageSrc!: string;

  @ApiProperty({ description: 'Accessible image alternative text' })
  imageAlt!: string;

  @ApiProperty({ enum: AuctionCategoryKey })
  categoryKey!: AuctionCategoryKey;
}

export class AuctionReadObject {
  @ApiProperty({ description: 'Stable auction identifier used by API and socket rooms' })
  auctionId!: string;

  @ApiProperty({ description: 'On-chain order ID from ArtAuctionEscrow' })
  onChainOrderId!: string;

  @ApiPropertyOptional({ description: 'Escrow smart contract address' })
  contractAddress?: string | null;

  @ApiProperty({ enum: AuctionStatusKey })
  statusKey!: AuctionStatusKey;

  @ApiProperty({ description: 'Human-readable auction status label' })
  statusLabel!: string;

  @ApiProperty({ description: 'Current highest bid in wei' })
  currentBidWei!: string;

  @ApiProperty({ description: 'Current highest bid in ETH for presentation filtering' })
  currentBidEth!: number;

  @ApiProperty({ description: 'Minimum valid next bid in wei' })
  minimumNextBidWei!: string;

  @ApiProperty({ description: 'Minimum valid next bid in ETH' })
  minimumNextBidEth!: number;

  @ApiProperty({ description: 'Configured minimum bid increment in wei' })
  minBidIncrementWei!: string;

  @ApiProperty({ description: 'Auction end time as ISO-8601 string' })
  endsAt!: string;

  @ApiProperty({ description: 'Server time as ISO-8601 string for countdown calibration' })
  serverTime!: string;

  @ApiPropertyOptional({ description: 'Current highest bidder wallet address' })
  highestBidder?: string | null;

  @ApiPropertyOptional({ description: 'Seller wallet address' })
  sellerWallet?: string | null;

  @ApiPropertyOptional({ description: 'Last relevant blockchain transaction hash' })
  txHash?: string | null;

  @ApiProperty({ type: () => AuctionArtworkDisplayObject })
  artwork!: AuctionArtworkDisplayObject;
}

export class PaginatedAuctionsObject {
  @ApiProperty({ type: () => [AuctionReadObject] })
  data!: AuctionReadObject[];

  @ApiProperty({ description: 'Total matching auction rows' })
  total!: number;
}
