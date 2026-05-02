import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ArtworkStatus } from '../../../enums/artwork-status.enum';

export class GetArtworksQueryDto {
  @ApiProperty({
    description: 'Filter by seller ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  sellerId?: string;

  @ApiProperty({
    description: 'Search by title or description',
    example: 'landscape painting',
    required: false,
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({
    description: 'Filter by artwork status',
    enum: ArtworkStatus,
    example: ArtworkStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(ArtworkStatus)
  status?: ArtworkStatus;

  @ApiProperty({
    description: 'Filter by public profile visibility',
    example: true,
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({
    description: 'Filter by an exact on-chain auction ID',
    example: 'auction-0001',
    required: false,
  })
  @IsOptional()
  @IsString()
  onChainAuctionId?: string;

  @ApiProperty({
    description: 'Only return artworks that have an on-chain auction ID',
    example: true,
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasOnChainAuctionId?: boolean;

  @ApiProperty({
    description: 'Filter by minimum price',
    example: 0,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({
    description: 'Filter by maximum price',
    example: 1000,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({
    description: 'Number of records to skip for pagination',
    example: 0,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
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
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  take?: number;

  @ApiProperty({
    description: 'Field to sort by',
    enum: ['createdAt', 'updatedAt', 'title', 'price', 'status', 'likeCount'],
    example: 'createdAt',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: 'Sort direction',
    enum: ['ASC', 'DESC', 'asc', 'desc'],
    example: 'DESC',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder?: string;

  @ApiProperty({
    description:
      'Include seller-only auction start lifecycle enrichment for authenticated workspace views',
    example: true,
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeSellerAuctionLifecycle?: boolean;
}
