import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ArtworkStatus } from '../../../enums';
import { ArtworkImageInput, Dimensions, Weight } from '../../../interfaces';
import { ArtworkObject } from './artwork.object';

export type ArtworkDraftListingStatus = 'sale' | 'inquire' | 'sold';

export class CreateArtworkDraftInput {}

export class SaveArtworkDraftInput {
  @ApiPropertyOptional({ description: 'Artwork title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Artwork description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Artwork creation year' })
  @IsOptional()
  @IsNumber()
  creationYear?: number;

  @ApiPropertyOptional({ description: 'Edition run information' })
  @IsOptional()
  @IsString()
  editionRun?: string;

  @ApiPropertyOptional({ type: () => Dimensions })
  @IsOptional()
  dimensions?: Dimensions;

  @ApiPropertyOptional({ type: () => Weight })
  @IsOptional()
  weight?: Weight;

  @ApiPropertyOptional({ description: 'Materials used in the artwork' })
  @IsOptional()
  @IsString()
  materials?: string;

  @ApiPropertyOptional({ description: 'Physical artwork location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Listing price as decimal string' })
  @IsOptional()
  @IsString()
  price?: string;

  @ApiPropertyOptional({ description: 'Currency code' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Available quantity' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ enum: ArtworkStatus })
  @IsOptional()
  @IsEnum(ArtworkStatus)
  status?: ArtworkStatus;

  @ApiPropertyOptional({ description: 'Whether the artwork is published' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Folder ID, or null to keep the draft at root',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  folderId?: string | null;

  @ApiPropertyOptional({ type: [String], description: 'Associated tag IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiPropertyOptional({ type: [ArtworkImageInput] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArtworkImageInput)
  images?: ArtworkImageInput[];
}

export class SubmitArtworkDraftInput {
  @ApiProperty({
    enum: ['sale', 'inquire', 'sold'],
    description: 'Final listing state selected by the seller',
  })
  @IsIn(['sale', 'inquire', 'sold'])
  listingStatus!: ArtworkDraftListingStatus;

  @ApiPropertyOptional({ description: 'Required when listingStatus is sale' })
  @IsOptional()
  @IsString()
  price?: string;

  @ApiPropertyOptional({ description: 'Required when listingStatus is sale' })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Optional publish hint from the client' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class ArtworkUploadDraftObject extends ArtworkObject {
  @ApiPropertyOptional({
    example: 'folder-uuid-123',
    nullable: true,
    description: 'Folder containing this draft',
  })
  folderId?: string | null;

  @ApiPropertyOptional({
    type: [String],
    description: 'Tag IDs associated with this draft',
  })
  tagIds?: string[];

}
