import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommunityMediaType } from '@app/common';

export class MoodboardMediaObject {
  @ApiProperty({
    description: 'Uploaded moodboard media row ID',
  })
  id: string;

  @ApiProperty({
    description: 'Pending community media record consumed by this row',
  })
  communityMediaId: string;

  @ApiProperty({ enum: CommunityMediaType })
  mediaType: CommunityMediaType;

  @ApiProperty({
    description: 'Public URL for the media',
  })
  url: string;

  @ApiPropertyOptional({
    description: 'Secure URL for the media',
  })
  secureUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Thumbnail or poster URL when available',
  })
  thumbnailUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Video duration in seconds when available',
  })
  durationSeconds?: number | null;

  @ApiProperty({
    description: 'Display order inside the moodboard',
  })
  displayOrder: number;

  @ApiProperty({
    description: 'Whether this item is the moodboard cover',
  })
  isCover: boolean;
}

export class MoodboardArtworkObject {
  @ApiProperty({
    description: 'Artwork ID saved to the moodboard',
  })
  artworkId: string;

  @ApiProperty({
    description: 'Display order inside the moodboard',
  })
  displayOrder: number;

  @ApiPropertyOptional({
    description: 'Optional note attached to the saved artwork',
  })
  notes?: string | null;

  @ApiPropertyOptional({
    description: 'Tags attached to the saved artwork',
    type: [String],
  })
  tags?: string[] | null;

  @ApiProperty({
    description: 'Whether this artwork is marked as favorite in the moodboard',
  })
  isFavorite: boolean;

  @ApiPropertyOptional({
    description: 'Denormalized artwork title captured at save time',
  })
  artworkTitle?: string | null;

  @ApiPropertyOptional({
    description: 'Denormalized artwork image URL captured at save time',
  })
  artworkImageUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Denormalized artwork price captured at save time',
  })
  artworkPrice?: string | null;

  @ApiPropertyOptional({
    description: 'Denormalized seller ID captured at save time',
  })
  artworkSellerId?: string | null;

  @ApiPropertyOptional({
    description: 'Artwork availability status captured at save time',
  })
  availabilityStatus?: string | null;

  @ApiProperty({
    description: 'Number of views from the moodboard context',
  })
  viewCount: number;

  @ApiProperty({
    description: 'Whether the viewer has inquired about this saved artwork',
  })
  hasInquired: boolean;

  @ApiProperty({
    description: 'Whether this saved artwork was purchased',
  })
  wasPurchased: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Last update timestamp',
  })
  updatedAt?: Date | null;
}

export class MoodboardObject {
  @ApiProperty({
    description: 'Unique identifier of the moodboard',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who created the moodboard',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  userId: string;

  @ApiProperty({
    description: 'Title of the moodboard',
    example: 'Contemporary Art Collection',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the moodboard',
  })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Cover image URL',
  })
  coverImageUrl?: string | null;

  @ApiProperty({
    description: 'Whether the moodboard is private',
    example: false,
  })
  isPrivate: boolean;

  @ApiProperty({
    description: 'Number of artworks in the moodboard',
    example: 10,
  })
  artworkCount: number;

  @ApiProperty({
    description: 'Number of likes',
    example: 25,
  })
  likeCount: number;

  @ApiProperty({
    description: 'Number of views',
    example: 150,
  })
  viewCount: number;

  @ApiProperty({
    description: 'Number of shares',
    example: 5,
  })
  shareCount: number;

  @ApiProperty({
    description: 'Whether others can collaborate',
    example: false,
  })
  isCollaborative: boolean;

  @ApiPropertyOptional({
    description: 'List of collaborator user IDs',
    type: [String],
  })
  collaboratorIds?: string[] | null;

  @ApiPropertyOptional({
    description: 'Tags for categorization',
    type: [String],
  })
  tags?: string[] | null;

  @ApiPropertyOptional({
    description: 'Uploaded media items in display order',
    type: [MoodboardMediaObject],
  })
  media?: MoodboardMediaObject[];

  @ApiPropertyOptional({
    description: 'Artwork attachments saved to this moodboard',
    type: [MoodboardArtworkObject],
  })
  artworks?: MoodboardArtworkObject[];

  @ApiProperty({
    description: 'Display order for sorting',
    example: 0,
  })
  displayOrder: number;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Last update timestamp',
  })
  updatedAt?: Date | null;
}
