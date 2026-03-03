import { AbstractEntity, MomentMediaType } from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'moments' })
@Index(['userId', 'createdAt'])
@Index(['createdAt'])
@Index(['isArchived', 'expiresAt'])
export class Moment extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'moment_id' })
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'media_url', type: 'varchar', length: 1024 })
  mediaUrl!: string;

  @Column({ name: 'media_type', type: 'enum', enum: MomentMediaType })
  mediaType!: MomentMediaType;

  @Column({
    name: 'thumbnail_url',
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  thumbnailUrl: string | null;

  @Column({ type: 'text', nullable: true })
  caption: string | null;

  @Column({ name: 'is_pinned', type: 'boolean', default: false })
  isPinned!: boolean;

  @Column({ name: 'is_archived', type: 'boolean', default: false })
  isArchived!: boolean;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount!: number;

  @Column({ name: 'like_count', type: 'int', default: 0 })
  likeCount!: number;

  @Column({ name: 'comment_count', type: 'int', default: 0 })
  commentCount!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string | null;

  @Column({ type: 'jsonb', nullable: true })
  hashtags: string[] | null;

  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds: number | null;
}
