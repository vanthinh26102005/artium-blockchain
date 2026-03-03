import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AttachPaymentMethodDTO {
  @ApiProperty({
    description: 'Stripe payment method ID',
    example: 'pm_1234567890',
  })
  @IsNotEmpty()
  @IsString()
  paymentMethodId!: string;

  @ApiProperty({
    description: 'Stripe customer ID',
    example: 'cus_1234567890',
  })
  @IsNotEmpty()
  @IsString()
  stripeCustomerId!: string;

  @ApiProperty({
    description: 'User ID in the system',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  userId!: string;
}
