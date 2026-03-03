import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
