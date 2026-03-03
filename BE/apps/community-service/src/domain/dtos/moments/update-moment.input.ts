import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsArray,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class UpdateMomentInput {
  @ApiPropertyOptional({
    description: 'Updated caption for the moment',
    maxLength: 2200,
    example: 'Updated caption text',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2200)
  caption?: string;

  @ApiPropertyOptional({
    description: 'Whether to pin this moment to profile',
  })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to archive this moment',
  })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @ApiPropertyOptional({
    description: 'Updated location',
    example: 'Los Angeles, CA',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({
    description: 'Updated hashtags',
    example: ['newart', 'gallery'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];
}
