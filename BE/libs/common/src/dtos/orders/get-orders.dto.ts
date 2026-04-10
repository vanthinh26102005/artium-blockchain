import { EscrowState, OrderPaymentMethod, OrderStatus } from '@app/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class GetOrdersDto {
  @ApiProperty({
    description: 'Filter by buyer ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  buyerId?: string;

  @ApiProperty({
    description: 'Filter by seller ID',
    example: '987fcdeb-51a2-43d1-b789-012345678901',
    required: false,
  })
  @IsOptional()
  @IsString()
  sellerId?: string;

  @ApiProperty({
    description: 'Filter by on-chain order ID',
    example: 'ORDER-0001',
    required: false,
  })
  @IsOptional()
  @IsString()
  onChainOrderId?: string;

  @ApiProperty({
    description: 'Filter by order status',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({
    description: 'Filter by escrow state',
    enum: EscrowState,
    example: EscrowState.ENDED,
    required: false,
  })
  @IsOptional()
  @IsEnum(EscrowState)
  escrowState?: EscrowState;

  @ApiProperty({
    description: 'Filter by payment method',
    enum: OrderPaymentMethod,
    example: OrderPaymentMethod.BLOCKCHAIN,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderPaymentMethod)
  paymentMethod?: OrderPaymentMethod;

  @ApiProperty({
    description: 'Number of records to skip for pagination',
    example: 0,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  skip?: number;

  @ApiProperty({
    description: 'Maximum number of records to return',
    example: 20,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  take?: number;
}
