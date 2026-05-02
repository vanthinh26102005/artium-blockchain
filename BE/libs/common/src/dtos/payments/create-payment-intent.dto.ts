import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
  IsObject,
} from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({
    description: 'Amount in cents (e.g., 1000 = $10.00)',
    example: 1000,
    minimum: 1,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Amount is required' })
  @Min(1, { message: 'Amount must be at least 1 cent' })
  amount: number;

  @ApiProperty({
    description: 'Currency code (ISO 4217 standard)',
    example: 'usd',
    minLength: 3,
    maxLength: 3,
  })
  @IsString()
  @IsNotEmpty({ message: 'Currency is required' })
  currency: string;

  @ApiPropertyOptional({
    description:
      'User ID making the payment (injected from auth token, not required in request body)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  userId?: string;

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
    description: 'Optional metadata for the payment',
    example: { orderId: 'order_123', productId: 'artwork_456' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}
