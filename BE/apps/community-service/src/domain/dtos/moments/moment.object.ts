import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MomentMediaType } from '@app/common';

export class MomentObject {
  @ApiProperty({
    description: 'Unique identifier of the moment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who created the moment',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  userId: string;

  @ApiProperty({
    description: 'URL of the media',
    example: 'https://storage.example.com/moments/image.jpg',
  })
  mediaUrl: string;

  @ApiProperty({
    enum: MomentMediaType,
    description: 'Type of media',
    example: MomentMediaType.IMAGE,
  })
  mediaType: MomentMediaType;

  @ApiPropertyOptional({
    description: 'Thumbnail URL for video content',
  })
  thumbnailUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Caption text',
  })
  caption?: string | null;

  @ApiProperty({
    description: 'Whether moment is pinned',
    example: false,
  })
  isPinned: boolean;

  @ApiProperty({
    description: 'Whether moment is archived',
    example: false,
  })
  isArchived: boolean;

  @ApiPropertyOptional({
    description: 'Expiration date for ephemeral moments',
  })
  expiresAt?: Date | null;

  @ApiProperty({
    description: 'Number of views',
    example: 150,
  })
  viewCount: number;

  @ApiProperty({
    description: 'Number of likes',
    example: 25,
  })
  likeCount: number;

  @ApiProperty({
    description: 'Number of comments',
    example: 5,
  })
  commentCount: number;

  @ApiPropertyOptional({
    description: 'Location where moment was captured',
  })
  location?: string | null;

  @ApiPropertyOptional({
    description: 'Associated hashtags',
    type: [String],
  })
  hashtags?: string[] | null;

  @ApiPropertyOptional({
    description: 'Duration in seconds for video',
  })
  durationSeconds?: number | null;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Last update timestamp',
  })
  updatedAt?: Date | null;
}
