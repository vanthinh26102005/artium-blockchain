import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class BulkUpdateArtworkStatusInput {
  @ApiProperty({
    description: 'Array of artwork IDs to update',
    example: ['artwork-1', 'artwork-2'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  artworkIds!: string[];

  @ApiProperty({
    description: 'New status for all artworks',
    enum: [
      'DRAFT',
      'ACTIVE',
      'SOLD',
      'RESERVED',
      'INACTIVE',
      'DELETED',
      'PENDING_REVIEW',
    ],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum([
    'DRAFT',
    'ACTIVE',
    'SOLD',
    'RESERVED',
    'INACTIVE',
    'DELETED',
    'PENDING_REVIEW',
  ])
  status!: string;

  @ApiProperty({
    description: 'Seller ID for authorization',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  sellerId!: string;
}
