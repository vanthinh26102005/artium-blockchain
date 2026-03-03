import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsObject,
  Min,
  MaxLength,
} from 'class-validator';

export class CreatePaymentIntentDTO {
  @ApiProperty({
    description: 'Payment amount in dollars',
    example: 99.99,
    minimum: 0.5,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.5)
  amount!: number;

  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'usd',
    default: 'usd',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(3)
  currency!: string;

  @ApiProperty({
    description: 'User ID making the payment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @ApiPropertyOptional({
    description: 'Seller ID receiving the payment',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsString()
  sellerId?: string;

  @ApiPropertyOptional({
    description: 'Order ID associated with this payment',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiPropertyOptional({
    description: 'Invoice ID associated with this payment',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  @IsOptional()
  @IsString()
  invoiceId?: string;

  @ApiPropertyOptional({
    description: 'Stripe customer ID',
    example: 'cus_1234567890',
  })
  @IsOptional()
  @IsString()
  stripeCustomerId?: string;

  @ApiPropertyOptional({
    description: 'Stripe payment method ID',
    example: 'pm_1234567890',
  })
  @IsOptional()
  @IsString()
  stripePaymentMethodId?: string;

  @ApiPropertyOptional({
    description: 'Payment description',
    example: 'Payment for artwork purchase',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { artworkId: 'art_123', artistName: 'John Doe' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}
