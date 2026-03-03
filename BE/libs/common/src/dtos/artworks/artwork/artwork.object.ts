import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArtworkStatus } from '../../../enums/artwork-status.enum';
import { ArtworkImage } from '../../../interfaces/artwork-image.interface';
import { Dimensions, Weight } from '@app/common/interfaces';

export class ArtworkObject {
  @ApiProperty({
    example: 'artwork-uuid-123',
    description: 'Artwork unique identifier',
  })
  id!: string;

  @ApiProperty({
    example: 'seller-uuid-456',
    description: 'Seller ID who owns the artwork',
  })
  sellerId!: string;

  @ApiProperty({
    example: 'Sunset Over Water',
    description: 'Artwork title',
  })
  title!: string;

  @ApiPropertyOptional({
    example: 'An abstract painting inspired by sunsets.',
    description: 'Artwork description',
  })
  description?: string;

  @ApiPropertyOptional({
    example: 2023,
    description: 'Year the artwork was created',
  })
  creationYear?: number;

  @ApiPropertyOptional({
    example: 'Limited Edition of 10',
    description: 'Edition run information',
  })
  editionRun?: string;

  @ApiPropertyOptional({
    type: Object,
    example: { width: 100, height: 80, unit: 'cm' },
    description: 'Artwork dimensions',
  })
  dimensions?: Dimensions;

  @ApiPropertyOptional({
    type: Object,
    example: { value: 2.5, unit: 'kg' },
    description: 'Artwork weight',
  })
  weight?: Weight;

  @ApiPropertyOptional({
    example: 'Oil on canvas',
    description: 'Materials used in the artwork',
  })
  materials?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['Paris', 'France'],
    description: 'Artwork location',
  })
  location?: string[];

  @ApiPropertyOptional({
    example: 1200,
    description: 'Artwork price',
  })
  price?: number;

  @ApiPropertyOptional({
    example: 'USD',
    description: 'Currency code',
  })
  currency?: string;

  @ApiProperty({
    example: 1,
    description: 'Available quantity',
  })
  quantity!: number;

  @ApiProperty({
    enum: ArtworkStatus,
    example: ArtworkStatus.DRAFT,
    description: 'Artwork status',
  })
  status!: ArtworkStatus;

  @ApiProperty({
    example: true,
    description: 'Whether the artwork is published',
  })
  isPublished!: boolean;

  @ApiPropertyOptional({
    type: () => [ArtworkImage],
    description: 'Artwork images',
  })
  images?: ArtworkImage[];

  @ApiProperty({
    example: '2024-01-01T12:00:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2024-01-10T08:30:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'Folder containing the artwork',
  })
  folder?: any;

  @ApiPropertyOptional({
    description: 'Associated tags',
  })
  tags?: any[];
}
