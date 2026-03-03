import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsArray,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class CreateMoodboardInput {
  @ApiProperty({
    description: 'User ID who is creating the moodboard',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Title of the moodboard',
    maxLength: 255,
    example: 'Contemporary Art Collection',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the moodboard',
    maxLength: 2000,
    example: 'A curated collection of contemporary artworks',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Cover image URL',
    example: 'https://storage.example.com/moodboards/cover.jpg',
  })
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Whether the moodboard is private',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @ApiPropertyOptional({
    description: 'Whether others can collaborate on this moodboard',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isCollaborative?: boolean;

  @ApiPropertyOptional({
    description: 'Tags for categorization',
    example: ['modern', 'abstract', 'sculpture'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[] | null;
}
