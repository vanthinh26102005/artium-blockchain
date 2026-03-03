import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ArtworkStatus } from '../../../enums';
import { Dimensions, Weight, ArtworkImageInput } from '../../../interfaces';

export class CreateArtworkInput {
  @ApiProperty({
    description: 'The unique identifier of the seller',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  sellerId!: string;

  @ApiProperty({
    description: 'The title of the artwork',
    example: 'Starry Night',
  })
  @IsString()
  title!: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the artwork',
    example: 'A beautiful painting of the night sky',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'The year the artwork was created',
    example: 2023,
  })
  @IsOptional()
  @IsNumber()
  creationYear?: number;

  @ApiPropertyOptional({
    description: 'Edition run information',
    example: '1/100',
  })
  @IsOptional()
  @IsString()
  editionRun?: string;

  @ApiPropertyOptional({
    description: 'Dimensions of the artwork',
    type: () => Dimensions,
  })
  @IsOptional()
  dimensions?: Dimensions;

  @ApiPropertyOptional({
    description: 'Weight of the artwork',
    type: () => Weight,
  })
  @IsOptional()
  weight?: Weight;

  @ApiPropertyOptional({
    description: 'Materials used in the artwork',
    example: 'Oil on canvas',
  })
  @IsOptional()
  @IsString()
  materials?: string;

  @ApiPropertyOptional({
    description: 'Physical location of the artwork',
    example: 'New York, NY',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Price of the artwork',
    example: '1500.00',
  })
  @IsOptional()
  @IsString()
  price?: string;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'USD',
    default: 'USD',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Available quantity',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  quantity!: number;

  @ApiPropertyOptional({
    description: 'Current status of the artwork',
    enum: ArtworkStatus,
    default: ArtworkStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ArtworkStatus)
  status!: ArtworkStatus;

  @ApiPropertyOptional({
    description: 'Whether the artwork is published',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublished!: boolean;

  @ApiPropertyOptional({
    description: 'The folder ID where this artwork belongs',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsString()
  folderId?: string;

  @ApiPropertyOptional({
    description: 'Array of tag IDs associated with the artwork',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  tagIds?: string[];

  @ApiPropertyOptional({
    description: 'Array of images associated with the artwork',
    type: [ArtworkImageInput],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArtworkImageInput)
  images?: ArtworkImageInput[];
}
