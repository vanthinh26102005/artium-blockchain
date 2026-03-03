import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FollowerObject {
  @ApiProperty({
    description: 'User ID of the follower (who is following)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string; // followingUserId

  @ApiProperty({
    description: 'User ID being followed',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  followedUserId: string;

  @ApiProperty({
    description: 'Whether the follow is mutual (both users follow each other)',
    example: false,
  })
  isMutual: boolean;

  @ApiProperty({
    description: 'Whether to notify on new posts',
    example: true,
  })
  notifyOnPosts: boolean;

  @ApiProperty({
    description: 'Whether to notify on new events',
    example: true,
  })
  notifyOnEvents: boolean;

  @ApiPropertyOptional({
    description: 'Source of the follow action',
  })
  followSource?: string | null;

  @ApiProperty({
    description: 'Whether this was an automatic follow',
    example: false,
  })
  isAutoFollow: boolean;

  @ApiProperty({
    description: 'Engagement score for this relationship',
    example: 50,
  })
  engagementScore: number;

  @ApiPropertyOptional({
    description: 'Last time the follower viewed the followed user content',
  })
  lastViewedAt?: Date | null;

  @ApiProperty({
    description: 'When the follow relationship was created',
  })
  createdAt: Date;
}
