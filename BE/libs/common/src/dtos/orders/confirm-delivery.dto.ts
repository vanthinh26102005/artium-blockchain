import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const DELIVERY_CONFIRMATION_METHODS = [
  'app',
  'app_signature',
  'wallet',
] as const;

export type DeliveryConfirmationMethod =
  (typeof DELIVERY_CONFIRMATION_METHODS)[number];

export class ConfirmDeliveryDto {
  @ApiPropertyOptional({
    description: 'Optional notes from buyer about the delivery',
    example: 'Artwork received in perfect condition',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Confirmation method used by the buyer',
    enum: DELIVERY_CONFIRMATION_METHODS,
    example: 'app_signature',
  })
  @IsOptional()
  @IsIn(DELIVERY_CONFIRMATION_METHODS)
  confirmationMethod?: DeliveryConfirmationMethod;

  @ApiPropertyOptional({
    description: 'Buyer hand-drawn delivery signature as a PNG data URL',
  })
  @IsOptional()
  @IsString()
  @MaxLength(250000)
  signatureDataUrl?: string;

  @ApiPropertyOptional({
    description: 'Wallet transaction hash for on-chain delivery confirmation',
    example: '0xabc123...',
  })
  @IsOptional()
  @IsString()
  @MaxLength(66)
  transactionHash?: string;
}
