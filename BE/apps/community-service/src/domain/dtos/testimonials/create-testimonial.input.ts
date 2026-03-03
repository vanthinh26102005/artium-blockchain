import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsBoolean,
  MaxLength,
  Min,
  Max,
  IsObject,
} from 'class-validator';

export class DetailedRatingsInput {
  @ApiPropertyOptional({
    description: 'Rating for accuracy (1-5)',
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  accuracy?: number | null;

  @ApiPropertyOptional({
    description: 'Rating for communication (1-5)',
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  communication?: number | null;

  @ApiPropertyOptional({
    description: 'Rating for shipping (1-5)',
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  shipping?: number | null;

  @ApiPropertyOptional({
    description: 'Rating for value (1-5)',
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  value?: number | null;
}

export class CreateTestimonialInput {
  @ApiProperty({
    description: 'Buyer user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  buyerId: string;

  @ApiProperty({
    description: 'Seller user ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsString()
  @IsNotEmpty()
  sellerId: string;

  @ApiProperty({
    description: 'Artwork ID being reviewed',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsString()
  @IsNotEmpty()
  artworkId: string;

  @ApiPropertyOptional({
    description: 'Order ID associated with this review',
  })
  @IsOptional()
  @IsString()
  orderId?: string | null;

  @ApiProperty({
    description: 'Overall rating (1-5)',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Review comment',
    maxLength: 5000,
    example: 'The artwork arrived in perfect condition. Amazing quality!',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  comment?: string | null;

  @ApiPropertyOptional({
    description: 'Cached buyer name for display',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  buyerName?: string | null;

  @ApiPropertyOptional({
    description: 'Cached artwork title for display',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  artworkTitle?: string | null;

  @ApiPropertyOptional({
    description: 'Whether this is a verified purchase',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isVerifiedPurchase?: boolean;

  @ApiPropertyOptional({
    description: 'URLs to review images',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  reviewImages?: string[] | null;

  @ApiPropertyOptional({
    description: 'Detailed ratings breakdown',
    type: DetailedRatingsInput,
  })
  @IsOptional()
  @IsObject()
  detailedRatings?: DetailedRatingsInput | null;
}
