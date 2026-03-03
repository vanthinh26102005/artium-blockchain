import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateInvoiceItemDto {
  @ApiPropertyOptional({
    description: 'Artwork ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  artworkId?: string;

  @ApiPropertyOptional({
    description: 'Artwork title',
    example: 'Sunset Painting',
  })
  @IsOptional()
  @IsString()
  artworkTitle?: string;

  @ApiPropertyOptional({
    description: 'Artwork image URL',
    example: 'https://example.com/artwork.jpg',
  })
  @IsOptional()
  @IsString()
  artworkImageUrl?: string;

  @ApiProperty({
    description: 'Item description',
    example: 'Original oil painting on canvas',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Quantity',
    example: 1,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Unit price in dollars',
    example: 1500.0,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({
    description: 'Tax rate as decimal (e.g., 0.08 for 8%)',
    example: 0.08,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @ApiPropertyOptional({
    description: 'Discount amount in dollars',
    example: 100.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({
    description: 'Additional notes for this item',
    example: 'Includes certificate of authenticity',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateInvoiceDto {
  @ApiProperty({
    description: 'Seller ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  sellerId: string;

  @ApiPropertyOptional({
    description: 'Collector/Buyer ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  collectorId?: string;

  @ApiProperty({
    description: 'Customer email address',
    example: 'customer@example.com',
  })
  @IsNotEmpty()
  @IsString()
  customerEmail: string;

  @ApiProperty({
    description: 'Invoice number',
    example: 'INV-2024-001',
  })
  @IsNotEmpty()
  @IsString()
  invoiceNumber: string;

  @ApiPropertyOptional({
    description: 'Order ID associated with this invoice',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'usd',
  })
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'Invoice issue date',
    example: '2024-01-15',
  })
  @IsNotEmpty()
  @IsDateString()
  issueDate: string;

  @ApiProperty({
    description: 'Invoice due date',
    example: '2024-02-15',
  })
  @IsNotEmpty()
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Thank you for your purchase!',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Terms and conditions',
    example: 'Payment due within 30 days. Late fees may apply.',
  })
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiProperty({
    description: 'Invoice line items',
    type: [CreateInvoiceItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}
