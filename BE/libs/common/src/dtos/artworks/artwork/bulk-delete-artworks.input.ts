import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class BulkDeleteArtworksInput {
  @ApiProperty({
    description: 'Array of artwork IDs to delete',
    example: ['artwork-1', 'artwork-2'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  artworkIds!: string[];

  @ApiProperty({
    description: 'Seller ID for authorization',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  sellerId!: string;
}
