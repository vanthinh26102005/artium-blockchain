import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ConfirmPaymentIntentDTO {
  @ApiProperty({
    description: 'Stripe payment intent ID',
    example: 'pi_1234567890',
  })
  @IsNotEmpty()
  @IsString()
  paymentIntentId!: string;

  @ApiPropertyOptional({
    description: 'Stripe payment method ID (if not already attached)',
    example: 'pm_1234567890',
  })
  @IsOptional()
  @IsString()
  stripePaymentMethodId?: string;

  @ApiPropertyOptional({
    description: 'Return URL for redirect-based payment methods',
    example: 'https://yourapp.com/payments/complete',
  })
  @IsOptional()
  @IsString()
  returnUrl?: string;
}
