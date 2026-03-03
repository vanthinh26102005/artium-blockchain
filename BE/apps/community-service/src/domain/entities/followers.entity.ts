import { AbstractEntity } from '@app/common';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'followers' })
@Index(['followingUserId', 'followedUserId'], { unique: true })
@Index(['followedUserId', 'createdAt'])
@Index(['followingUserId', 'createdAt'])
export class Follower extends AbstractEntity {
  @PrimaryColumn('uuid', { name: 'following_user_id' })
  followingUserId!: string;

  @PrimaryColumn({ name: 'followed_user_id', type: 'uuid' })
  followedUserId!: string;

  @Column({ name: 'is_mutual', type: 'boolean', default: false })
  isMutual!: boolean;

  @Column({ name: 'notify_on_posts', type: 'boolean', default: true })
  notifyOnPosts!: boolean;

  @Column({ name: 'notify_on_events', type: 'boolean', default: true })
  notifyOnEvents!: boolean;

  @Column({
    name: 'follow_source',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  followSource?: string | null;

  @Column({ name: 'is_auto_follow', type: 'boolean', default: false })
  isAutoFollow!: boolean;

  @Column({ name: 'engagement_score', type: 'int', default: 0 })
  engagementScore!: number;

  @Column({ name: 'last_viewed_at', type: 'timestamp', nullable: true })
  lastViewedAt?: Date | null;
}
