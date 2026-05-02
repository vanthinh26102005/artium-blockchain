import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { SellerAuctionReservePolicy } from './start-seller-auction.dto';

export enum SellerAuctionStartStatus {
  PENDING_START = 'pending_start',
  AUCTION_ACTIVE = 'auction_active',
  START_FAILED = 'start_failed',
  RETRY_AVAILABLE = 'retry_available',
}

export enum SellerAuctionStartFailureReason {
  ARTWORK_NOT_ELIGIBLE = 'ARTWORK_NOT_ELIGIBLE',
  SELLER_WALLET_MISSING = 'SELLER_WALLET_MISSING',
  SELLER_PROFILE_INACTIVE = 'SELLER_PROFILE_INACTIVE',
  BLOCKCHAIN_CONFIG_MISSING = 'BLOCKCHAIN_CONFIG_MISSING',
  WALLET_MISMATCH = 'WALLET_MISMATCH',
  INVALID_TRANSACTION_HASH = 'INVALID_TRANSACTION_HASH',
  ATTEMPT_NOT_FOUND = 'ATTEMPT_NOT_FOUND',
}

export class SellerAuctionStartTermsSnapshotObject {
  @ApiProperty({ enum: SellerAuctionReservePolicy })
  reservePolicy!: SellerAuctionReservePolicy;

  @ApiPropertyOptional({ description: 'Reserve price in ETH string form' })
  reservePriceEth?: string | null;

  @ApiProperty({ description: 'Minimum bid increment in ETH string form' })
  minBidIncrementEth!: string;

  @ApiProperty({ description: 'Auction duration in hours' })
  durationHours!: number;

  @ApiProperty({ description: 'Shipping disclosure shown to buyers' })
  shippingDisclosure!: string;

  @ApiProperty({ description: 'Payment disclosure shown to buyers' })
  paymentDisclosure!: string;

  @ApiProperty({
    description: 'Seller acknowledgement of post-activation locking',
  })
  economicsLockedAcknowledged!: boolean;
}

export class SellerAuctionStartWalletRequestObject {
  @ApiProperty({ description: 'Escrow contract address' })
  contractAddress!: string;

  @ApiProperty({
    description: 'Encoded calldata for ArtAuctionEscrow.createAuction(...)',
  })
  data!: string;
}

export class SellerAuctionStartStatusObject {
  @ApiProperty({ description: 'Auction start attempt UUID' })
  attemptId!: string;

  @ApiProperty({ description: 'Seller UUID' })
  sellerId!: string;

  @ApiProperty({ description: 'Artwork UUID' })
  artworkId!: string;

  @ApiProperty({
    description: 'Canonical on-chain order ID for this seller auction start',
  })
  orderId!: string;

  @ApiProperty({ enum: SellerAuctionStartStatus })
  status!: SellerAuctionStartStatus;

  @ApiProperty({ description: 'Artwork title snapshot' })
  artworkTitle!: string;

  @ApiPropertyOptional({ description: 'Artwork creator snapshot' })
  creatorName?: string | null;

  @ApiPropertyOptional({ description: 'Artwork thumbnail snapshot' })
  thumbnailUrl?: string | null;

  @ApiPropertyOptional({ description: 'Escrow contract address' })
  contractAddress?: string | null;

  @ApiPropertyOptional({
    description: 'Blockchain transaction hash once available',
  })
  txHash?: string | null;

  @ApiPropertyOptional({ description: 'Seller wallet bound to this attempt' })
  walletAddress?: string | null;

  @ApiPropertyOptional({ enum: SellerAuctionStartFailureReason })
  reasonCode?: SellerAuctionStartFailureReason | null;

  @ApiPropertyOptional({
    description: 'Seller-facing failure or guidance message',
  })
  reasonMessage?: string | null;

  @ApiProperty({
    description: 'Whether a retry can reuse this canonical attempt',
  })
  retryAllowed!: boolean;

  @ApiProperty({
    description:
      'Whether seller must return to editable terms before trying again',
  })
  editAllowed!: boolean;

  @ApiProperty({
    description: 'Whether the UI should keep prompting for wallet action',
  })
  walletActionRequired!: boolean;

  @ApiPropertyOptional({ type: () => SellerAuctionStartWalletRequestObject })
  transactionRequest?: SellerAuctionStartWalletRequestObject | null;

  @ApiProperty({ type: () => SellerAuctionStartTermsSnapshotObject })
  submittedTermsSnapshot!: SellerAuctionStartTermsSnapshotObject;

  @ApiPropertyOptional({
    description: 'Activation timestamp once the auction is live',
  })
  activatedAt?: string | null;

  @ApiProperty({ description: 'Attempt last-update timestamp' })
  updatedAt!: string;
}

export class AttachSellerAuctionStartTxDto {
  @ApiProperty({
    description: 'Connected seller wallet address used to submit createAuction',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Wallet address must be a valid EVM address',
  })
  walletAddress!: string;

  @ApiProperty({
    description: 'Submitted createAuction transaction hash',
    example:
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{64}$/, {
    message: 'Transaction hash must be a valid 32-byte hex string',
  })
  txHash!: string;
}
