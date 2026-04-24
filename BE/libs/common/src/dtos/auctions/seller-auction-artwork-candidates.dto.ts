import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArtworkStatus } from '../../enums/artwork-status.enum';

export enum SellerAuctionArtworkEligibilityReason {
  NOT_ACTIVE = 'NOT_ACTIVE',
  NOT_PUBLISHED = 'NOT_PUBLISHED',
  SOLD = 'SOLD',
  DELETED = 'DELETED',
  RESERVED = 'RESERVED',
  IN_AUCTION = 'IN_AUCTION',
  HAS_ON_CHAIN_AUCTION = 'HAS_ON_CHAIN_AUCTION',
  ACTIVE_ORDER_LOCK = 'ACTIVE_ORDER_LOCK',
  MULTI_QUANTITY = 'MULTI_QUANTITY',
  MISSING_PRIMARY_IMAGE = 'MISSING_PRIMARY_IMAGE',
  MISSING_METADATA = 'MISSING_METADATA',
}

export class SellerAuctionArtworkRecoveryActionObject {
  @ApiProperty({ enum: SellerAuctionArtworkEligibilityReason })
  reasonCode!: SellerAuctionArtworkEligibilityReason;

  @ApiProperty({ description: 'Seller-facing blocked reason copy' })
  message!: string;

  @ApiProperty({ description: 'Practical recovery hint for the seller' })
  actionLabel!: string;
}

export class SellerAuctionArtworkCandidateObject {
  @ApiProperty({ description: 'Artwork UUID' })
  artworkId!: string;

  @ApiProperty({ description: 'Seller UUID that owns this artwork' })
  sellerId!: string;

  @ApiProperty({ description: 'Artwork title' })
  title!: string;

  @ApiProperty({ description: 'Artist or creator display name' })
  creatorName!: string;

  @ApiPropertyOptional({ description: 'Primary artwork image URL' })
  thumbnailUrl!: string | null;

  @ApiProperty({ enum: ArtworkStatus })
  status!: ArtworkStatus;

  @ApiProperty({ description: 'Whether the artwork is publicly published' })
  isPublished!: boolean;

  @ApiProperty({ description: 'Available edition quantity' })
  quantity!: number;

  @ApiPropertyOptional({ description: 'Existing on-chain auction identifier' })
  onChainAuctionId!: string | null;

  @ApiProperty({ description: 'True only when no eligibility blockers exist' })
  isEligible!: boolean;

  @ApiProperty({ enum: SellerAuctionArtworkEligibilityReason, isArray: true })
  reasonCodes!: SellerAuctionArtworkEligibilityReason[];

  @ApiProperty({ type: () => [SellerAuctionArtworkRecoveryActionObject] })
  recoveryActions!: SellerAuctionArtworkRecoveryActionObject[];
}

export class SellerAuctionArtworkCandidatesResponse {
  @ApiProperty({ type: () => [SellerAuctionArtworkCandidateObject] })
  eligible!: SellerAuctionArtworkCandidateObject[];

  @ApiProperty({ type: () => [SellerAuctionArtworkCandidateObject] })
  blocked!: SellerAuctionArtworkCandidateObject[];

  @ApiProperty({ description: 'Total seller-owned candidate artworks checked' })
  total!: number;

  @ApiProperty({ description: 'Number of eligible artworks' })
  eligibleCount!: number;

  @ApiProperty({ description: 'Number of blocked artworks' })
  blockedCount!: number;
}
