import {
  ArtworkImageInput,
  ArtworkStatus,
  Dimensions,
  Weight,
} from '@app/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateArtworkInput {
  @ApiProperty({
    description: 'The unique identifier of the seller',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  sellerId!: string;

  @ApiPropertyOptional({
    description: 'The name of the creator/artist',
    example: 'Vincent van Gogh',
  })
  @IsOptional()
  @IsString()
  creatorName: string | null;

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
  description?: string;

  @ApiPropertyOptional({
    description: 'The year the artwork was created',
    example: 2023,
  })
  @IsOptional()
  creationYear?: number;

  @ApiPropertyOptional({
    description: 'Edition run information',
    example: '1/100',
  })
  @IsOptional()
  editionRun?: string;

  @ApiPropertyOptional({
    description: 'Dimensions of the artwork',
    type: 'array',
    items: { type: 'number' },
  })
  @IsOptional()
  dimensions?: Dimensions;

  @ApiPropertyOptional({
    description: 'Weight of the artwork',
    type: 'array',
    items: { type: 'number' },
  })
  @IsOptional()
  weight?: Weight;

  @ApiPropertyOptional({
    description: 'Materials used in the artwork',
    example: 'Oil on canvas',
  })
  @IsOptional()
  materials?: string;

  @ApiPropertyOptional({
    description: 'Physical location of the artwork',
    example: 'New York, NY',
  })
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    description: 'Price of the artwork',
    example: '1500.00',
  })
  @IsOptional()
  price?: string;

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD' })
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Available quantity',
    example: 1,
    default: 1,
  })
  @IsOptional()
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
  folderId?: string;

  @ApiPropertyOptional({
    description: 'Array of tag IDs associated with the artwork',
    type: [String],
  })
  @IsOptional()
  tagIds?: string[];

  @ApiPropertyOptional({
    description: 'Array of artwork images',
    type: [ArtworkImageInput],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArtworkImageInput)
  images?: ArtworkImageInput[];

  // ── Auction fields (on-chain integration) ──

  @ApiPropertyOptional({
    description: 'IPFS hash of artwork metadata for on-chain reference',
    example: 'QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ',
  })
  @IsOptional()
  @IsString()
  ipfsMetadataHash?: string;

  @ApiPropertyOptional({
    description: 'Reserve price in wei (minimum acceptable bid)',
    example: '1000000000000000000',
  })
  @IsOptional()
  @IsString()
  reservePrice?: string;

  @ApiPropertyOptional({
    description: 'Minimum bid increment in wei',
    example: '100000000000000000',
  })
  @IsOptional()
  @IsString()
  minBidIncrement?: string;

  @ApiPropertyOptional({
    description: 'Auction duration in seconds',
    example: 86400,
  })
  @IsOptional()
  @IsInt()
  @Min(60)
  auctionDuration?: number;

  @ApiPropertyOptional({
    description: 'On-chain auction ID from the smart contract',
    example: '0x...',
  })
  @IsOptional()
  @IsString()
  onChainAuctionId?: string;
}
