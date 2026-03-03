import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
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

  @ApiProperty({
    description: 'User ID making the payment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @ApiProperty({
    description: 'Optional metadata for the payment',
    example: { orderId: 'order_123', productId: 'artwork_456' },
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
