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
    description: 'Auction duration in hours',
    example: 168,
  })
  @IsInt()
  @Min(24)
  @Max(30 * 24)
  durationHours!: number;

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
