import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  Min,
} from 'class-validator';

export enum RefundReason {
  DUPLICATE = 'duplicate',
  FRAUDULENT = 'fraudulent',
  REQUESTED_BY_CUSTOMER = 'requested_by_customer',
}

export class CreateRefundDTO {
  @ApiProperty({
    description: 'Stripe payment intent ID to refund',
    example: 'pi_1234567890',
  })
  @IsNotEmpty()
  @IsString()
  paymentIntentId!: string;

  @ApiProperty({
    description: 'Transaction ID in the system',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  transactionId!: string;

  @ApiPropertyOptional({
    description: 'Refund amount in dollars (omit for full refund)',
    example: 50.0,
    minimum: 0.01,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional({
    description: 'Reason for the refund',
    enum: RefundReason,
    example: RefundReason.REQUESTED_BY_CUSTOMER,
  })
  @IsOptional()
  @IsEnum(RefundReason)
  reason?: RefundReason;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { requestedBy: 'customer_service', ticketId: 'SUP-12345' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}
