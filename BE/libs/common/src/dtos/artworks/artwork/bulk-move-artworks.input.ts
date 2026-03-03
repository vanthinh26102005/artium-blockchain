import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BulkMoveArtworksInput {
  @ApiProperty({
    description: 'Array of artwork IDs to move',
    example: ['artwork-1', 'artwork-2'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  artworkIds!: string[];

  @ApiPropertyOptional({
    description: 'Target folder ID (null or undefined for root)',
    example: 'folder-1',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  folderId?: string | null;

  @ApiProperty({
    description: 'Seller ID for authorization',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  sellerId!: string;
}
