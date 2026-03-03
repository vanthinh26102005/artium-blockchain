import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ActivityType {
  POSTED_ARTWORK = 'posted_artwork',
  CREATED_MOMENT = 'created_moment',
  CREATED_MOODBOARD = 'created_moodboard',
  LIKED_ARTWORK = 'liked_artwork',
  COMMENTED_ARTWORK = 'commented_artwork',
  FOLLOWED_USER = 'followed_user',
  PURCHASED_ARTWORK = 'purchased_artwork',
  CREATED_EVENT = 'created_event',
  RSVP_EVENT = 'rsvp_event',
  SHARED_MOODBOARD = 'shared_moodboard',
  LEFT_TESTIMONIAL = 'left_testimonial',
}

export class ActivityMetadata {
  @ApiPropertyOptional({ description: 'Title of the artwork' })
  artworkTitle?: string;

  @ApiPropertyOptional({ description: 'URL of the artwork image' })
  artworkImage?: string;

  @ApiPropertyOptional({ description: 'Title of the moodboard' })
  moodboardTitle?: string;

  @ApiPropertyOptional({ description: 'Title of the event' })
  eventTitle?: string;

  @ApiPropertyOptional({ description: 'Text of the comment' })
  commentText?: string;

  @ApiPropertyOptional({ description: 'Name of the followed user' })
  followedUserName?: string;

  @ApiPropertyOptional({ description: 'Price of the artwork' })
  artworkPrice?: number;

  @ApiPropertyOptional({ description: 'Currency' })
  currency?: string;
}

export class ActivityFeedObject {
  @ApiProperty({
    description: 'Unique identifier of the activity',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who performed the action',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  userId: string;

  @ApiProperty({
    enum: ActivityType,
    description: 'Type of activity',
    example: ActivityType.CREATED_MOMENT,
  })
  activityType: ActivityType;

  @ApiProperty({
    description: 'Type of the referenced entity',
    example: 'moment',
  })
  entityType: string;

  @ApiProperty({
    description: 'ID of the referenced entity',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  entityId: string;

  @ApiPropertyOptional({
    description: 'Target user ID (e.g., followed user)',
  })
  targetUserId?: string | null;

  @ApiPropertyOptional({
    description: 'Human-readable description',
  })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Flexible metadata object',
    type: ActivityMetadata,
  })
  metadata?: ActivityMetadata | null;

  @ApiProperty({
    description: 'Whether activity is public',
    example: true,
  })
  isPublic: boolean;

  @ApiProperty({
    description: 'Number of views',
    example: 100,
  })
  viewCount: number;

  @ApiProperty({
    description: 'Number of interactions',
    example: 15,
  })
  interactionCount: number;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Last update timestamp',
  })
  updatedAt?: Date | null;
}
