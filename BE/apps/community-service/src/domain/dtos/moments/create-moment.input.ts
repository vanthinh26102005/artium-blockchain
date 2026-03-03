import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MomentMediaType } from '@app/common';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsArray,
  IsBoolean,
  IsNumber,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateMomentInput {
  @ApiProperty({
    description: 'User ID who is creating the moment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'URL of the media (image or video)',
    example: 'https://storage.example.com/moments/image.jpg',
  })
  @IsUrl()
  @IsNotEmpty()
  mediaUrl: string;

  @ApiProperty({
    enum: MomentMediaType,
    description: 'Type of media (image or video)',
    example: MomentMediaType.IMAGE,
  })
  @IsEnum(MomentMediaType)
  @IsNotEmpty()
  mediaType: MomentMediaType;

  @ApiPropertyOptional({
    description: 'Thumbnail URL for video content',
    example: 'https://storage.example.com/moments/thumbnail.jpg',
  })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Caption for the moment',
    maxLength: 2200,
    example: 'Check out this amazing artwork!',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2200)
  caption?: string | null;

  @ApiPropertyOptional({
    description: 'Whether to pin this moment to profile',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiPropertyOptional({
    description: 'Location where the moment was captured',
    example: 'New York, NY',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string | null;

  @ApiPropertyOptional({
    description: 'Hashtags associated with the moment',
    example: ['art', 'painting', 'contemporary'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[] | null;

  @ApiPropertyOptional({
    description: 'Duration of video in seconds',
    minimum: 1,
    maximum: 60,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  durationSeconds?: number | null;

  @ApiPropertyOptional({
    description: 'Artwork IDs to tag in this moment',
    example: ['artwork-uuid-1', 'artwork-uuid-2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  taggedArtworkIds?: string[] | null;
}
