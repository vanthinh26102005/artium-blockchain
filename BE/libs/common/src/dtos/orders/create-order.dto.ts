import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty({
    description: 'Artwork ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty({ message: 'Artwork ID is required' })
  artworkId: string;

  @ApiProperty({
    description: 'Quantity of artwork',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;

  @ApiProperty({
    description: 'Price per item',
    example: 100.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Price must be non-negative' })
  price: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Buyer user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty({ message: 'Buyer ID is required' })
  buyerId: string;

  @ApiProperty({
    description: 'Seller user ID',
    example: '987fcdeb-51a2-43d1-b789-012345678901',
  })
  @IsString()
  @IsNotEmpty({ message: 'Seller ID is required' })
  sellerId: string;

  @ApiProperty({
    description: 'Array of order items',
    type: [OrderItemDto],
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsNotEmpty({ message: 'Order items are required' })
  items: OrderItemDto[];

  @ApiProperty({
    description: 'Shipping address',
    example: '123 Main St, City, Country',
    required: false,
  })
  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Please handle with care',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
