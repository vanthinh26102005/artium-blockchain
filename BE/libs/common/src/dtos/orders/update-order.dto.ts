import { OrderStatus } from '@app/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateOrderDto {
  @ApiProperty({
    description: 'Order status',
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Invalid order status' })
  status?: OrderStatus;

  @ApiProperty({
    description: 'Tracking number for shipment',
    example: 'TRACK123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Order has been shipped',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
