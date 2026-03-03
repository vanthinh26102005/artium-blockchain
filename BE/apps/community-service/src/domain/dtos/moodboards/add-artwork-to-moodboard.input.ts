import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
} from 'class-validator';

export class AddArtworkToMoodboardInput {
  @ApiProperty({
    description: 'Moodboard ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  moodboardId: string;

  @ApiProperty({
    description: 'Artwork ID to add',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsString()
  @IsNotEmpty()
  artworkId: string;

  @ApiPropertyOptional({
    description: 'Display order in the moodboard',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Notes about this artwork in the context of the moodboard',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Tags specific to this artwork-moodboard relationship',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Whether this is a favorite in the moodboard',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  // Cached artwork data (denormalized for performance)
  @ApiPropertyOptional({
    description: 'Cached artwork title',
  })
  @IsOptional()
  @IsString()
  artworkTitle?: string;

  @ApiPropertyOptional({
    description: 'Cached artwork image URL',
  })
  @IsOptional()
  @IsString()
  artworkImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Cached artwork price',
  })
  @IsOptional()
  @IsNumber()
  artworkPrice?: number;

  @ApiPropertyOptional({
    description: 'Cached artwork seller ID',
  })
  @IsOptional()
  @IsString()
  artworkSellerId?: string;
}
