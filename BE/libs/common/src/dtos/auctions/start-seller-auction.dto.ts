import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export enum SellerAuctionReservePolicy {
  NONE = 'none',
  SET = 'set',
}

const ETH_AMOUNT_PATTERN = /^(?:\d+\.?\d*|\.\d+)$/;
const DEFAULT_SELLER_AUCTION_MIN_DURATION_SECONDS = 24 * 60 * 60;
const DEFAULT_SELLER_AUCTION_MAX_DURATION_SECONDS = 30 * 24 * 60 * 60;

const parseDurationConfigSeconds = (
  value: string | undefined,
  fallback: number,
): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const SELLER_AUCTION_MIN_DURATION_SECONDS = parseDurationConfigSeconds(
  process.env.SELLER_AUCTION_MIN_DURATION_SECONDS,
  DEFAULT_SELLER_AUCTION_MIN_DURATION_SECONDS,
);

const configuredMaxDurationSeconds = parseDurationConfigSeconds(
  process.env.SELLER_AUCTION_MAX_DURATION_SECONDS,
  DEFAULT_SELLER_AUCTION_MAX_DURATION_SECONDS,
);

export const SELLER_AUCTION_MAX_DURATION_SECONDS =
  configuredMaxDurationSeconds >= SELLER_AUCTION_MIN_DURATION_SECONDS
    ? configuredMaxDurationSeconds
    : DEFAULT_SELLER_AUCTION_MAX_DURATION_SECONDS;

export class StartSellerAuctionDto {
  @ApiProperty({ description: 'Artwork UUID to start in auction mode' })
  @IsString()
  @IsNotEmpty()
  artworkId!: string;

  @ApiProperty({ enum: SellerAuctionReservePolicy })
  @IsEnum(SellerAuctionReservePolicy)
  reservePolicy!: SellerAuctionReservePolicy;

  @ApiPropertyOptional({
    description: 'Reserve price in ETH string form when reservePolicy is set',
    example: '1.25',
  })
  @ValidateIf(
    (value: StartSellerAuctionDto) =>
      value.reservePolicy === SellerAuctionReservePolicy.SET,
  )
  @IsString()
  @Matches(ETH_AMOUNT_PATTERN, {
    message: 'Reserve price must be a valid ETH amount',
  })
  reservePriceEth?: string | null;

  @ApiProperty({
    description: 'Minimum bid increment in ETH string form',
    example: '0.1',
  })
  @IsString()
  @Matches(ETH_AMOUNT_PATTERN, {
    message: 'Minimum bid increment must be a valid ETH amount',
  })
  minBidIncrementEth!: string;

  @ApiProperty({
    description: 'Auction duration in seconds',
    example: 604800,
  })
  @ValidateIf(
    (value: StartSellerAuctionDto) =>
      value.durationSeconds !== undefined ||
      value.durationHours === undefined ||
      value.durationHours === null,
  )
  @IsInt()
  @Min(SELLER_AUCTION_MIN_DURATION_SECONDS)
  @Max(SELLER_AUCTION_MAX_DURATION_SECONDS)
  durationSeconds?: number;

  @ApiPropertyOptional({
    description: 'Deprecated auction duration in hours. Use durationSeconds.',
    example: 168,
    deprecated: true,
  })
  @IsOptional()
  @IsInt()
  durationHours?: number;

  @ApiProperty({
    description:
      'Seller-authored shipping and fulfillment disclosure shown to buyers',
  })
  @IsString()
  @IsNotEmpty()
  shippingDisclosure!: string;

  @ApiProperty({
    description: 'Seller-authored payment expectations shown to buyers',
  })
  @IsString()
  @IsNotEmpty()
  paymentDisclosure!: string;

  @ApiProperty({
    description:
      'Seller acknowledgement that auction economics lock after activation',
  })
  @IsBoolean()
  economicsLockedAcknowledged!: boolean;
}
