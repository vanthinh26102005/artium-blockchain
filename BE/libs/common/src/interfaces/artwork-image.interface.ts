import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUrl,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class ArtworkImage {
  @ApiProperty({ description: 'Unique identifier for the image' })
  id!: string;

  @ApiProperty({ description: 'GCS file path (acts as public ID)' })
  publicId!: string;

  @ApiProperty({ description: 'Public URL of the image' })
  url!: string;

  @ApiProperty({ description: 'Secure HTTPS URL of the image' })
  secureUrl!: string;

  @ApiPropertyOptional({ description: 'Image format (webp, jpeg, png)' })
  format?: string;

  @ApiPropertyOptional({ description: 'Image width in pixels' })
  width?: number;

  @ApiPropertyOptional({ description: 'Image height in pixels' })
  height?: number;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  size?: number;

  @ApiPropertyOptional({ description: 'GCS bucket name' })
  bucket?: string;

  @ApiPropertyOptional({ description: 'Upload timestamp' })
  createdAt?: Date;

  @ApiPropertyOptional({ description: 'Alternative text for accessibility' })
  altText?: string;

  @ApiPropertyOptional({ description: 'Display order' })
  order?: number;

  @ApiPropertyOptional({ description: 'Whether this is the primary image' })
  isPrimary?: boolean;
}

export class ArtworkImageInput {
  @ApiProperty({ description: 'GCS file path' })
  @IsString()
  publicId!: string;

  @ApiProperty({ description: 'Public URL' })
  @IsString()
  url!: string;

  @ApiProperty({ description: 'Secure URL' })
  @IsUrl()
  secureUrl!: string;

  @ApiPropertyOptional({ description: 'Image format' })
  @IsOptional()
  @IsString()
  format?: string;

  @ApiPropertyOptional({ description: 'Width in pixels' })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiPropertyOptional({ description: 'Height in pixels' })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsOptional()
  @IsNumber()
  size?: number;

  @ApiPropertyOptional({ description: 'GCS bucket name' })
  @IsOptional()
  @IsString()
  bucket?: string;

  @ApiPropertyOptional({ description: 'Alternative text' })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ description: 'Primary image flag' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class CreateArtworkImageInput {
  @ApiPropertyOptional({ description: 'Alternative text for the image' })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ description: 'Mark as primary image' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
