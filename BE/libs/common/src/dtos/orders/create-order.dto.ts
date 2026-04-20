import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class ShippingAddressDto {
  @ApiProperty({ description: 'Address line 1', example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  line1: string;

  @ApiPropertyOptional({ description: 'Address line 2', example: 'Apt 4B' })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty({ description: 'City', example: 'New York' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'State or province', example: 'NY' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'Postal code', example: '10001' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({ description: 'Country code', example: 'US' })
  @IsString()
  @IsNotEmpty()
  country: string;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Buyer user ID (auto-filled from JWT in gateway)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  buyerId?: string;

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

  @ApiPropertyOptional({
    description: 'Shipping address',
    type: ShippingAddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress?: ShippingAddressDto;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Please handle with care',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
