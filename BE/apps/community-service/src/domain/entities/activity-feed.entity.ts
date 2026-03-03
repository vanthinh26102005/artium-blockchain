import { AbstractEntity } from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

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

@Entity({ name: 'activity_feeds' })
@Index(['userId', 'createdAt'])
@Index(['activityType', 'createdAt'])
@Index(['createdAt'])
export class ActivityFeed extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'activity_id' })
  id!: string;

  @Column({
    name: 'user_id',
    type: 'uuid',
    comment: 'User who performed the activity',
  })
  userId!: string;

  @Column({
    name: 'activity_type',
    type: 'enum',
    enum: ActivityType,
  })
  activityType!: ActivityType;

  @Column({ name: 'entity_type', type: 'varchar', length: 50, nullable: true })
  entityType: string | null;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId: string | null;

  @Column({
    name: 'target_user_id',
    type: 'uuid',
    nullable: true,
    comment: 'User affected by activity (e.g., followed user)',
  })
  targetUserId: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Additional activity data',
  })
  metadata: {
    artworkTitle?: string;
    artworkImage?: string;
    moodboardTitle?: string;
    eventTitle?: string;
    commentText?: string;
    [key: string]: any;
  } | null;

  @Column({ name: 'is_public', type: 'boolean', default: true })
  isPublic!: boolean;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount!: number;

  @Column({
    name: 'interaction_count',
    type: 'int',
    default: 0,
    comment: 'Likes, comments on this activity',
  })
  interactionCount!: number;
}
