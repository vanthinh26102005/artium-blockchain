import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export enum PayoutProviderDto {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
}

export class CreatePayoutDto {
  @ApiProperty({
    description: 'Seller ID receiving the payout',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  sellerId: string;

  @ApiProperty({
    description: 'Payout provider',
    enum: PayoutProviderDto,
    example: PayoutProviderDto.STRIPE,
  })
  @IsNotEmpty()
  @IsEnum(PayoutProviderDto)
  provider: PayoutProviderDto;

  @ApiProperty({
    description: 'Payout amount in dollars',
    example: 1000.0,
    minimum: 0.01,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'usd',
  })
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiPropertyOptional({
    description: 'Transaction fee in dollars',
    example: 25.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  transactionFee?: number;

  @ApiProperty({
    description: 'Transaction IDs included in this payout',
    example: [
      '123e4567-e89b-12d3-a456-426614174001',
      '123e4567-e89b-12d3-a456-426614174002',
    ],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  transactionIds: string[];

  @ApiPropertyOptional({
    description: 'Payout description',
    example: 'Weekly payout for artwork sales',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Scheduled payout date',
    example: '2024-01-20',
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
