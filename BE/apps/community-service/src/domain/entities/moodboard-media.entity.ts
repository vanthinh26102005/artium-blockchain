import { AbstractEntity, CommunityMediaType } from '@app/common';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Moodboard } from './moodboards.entity';
import { CommunityMedia } from './community-media.entity';

@Entity({ name: 'moodboard_media' })
@Unique(['moodboardId', 'communityMediaId'])
@Index(['moodboardId', 'displayOrder'])
@Index(['communityMediaId'])
export class MoodboardMedia extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'moodboard_media_id' })
  id!: string;

  @Column({ name: 'moodboard_id', type: 'uuid' })
  moodboardId!: string;

  @Column({ name: 'community_media_id', type: 'uuid' })
  communityMediaId!: string;

  @Column({ name: 'media_type', type: 'enum', enum: CommunityMediaType })
  mediaType!: CommunityMediaType;

  @Column({ type: 'varchar', length: 1024 })
  url!: string;

  @Column({
    name: 'secure_url',
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  secureUrl: string | null;

  @Column({
    name: 'thumbnail_url',
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  thumbnailUrl: string | null;

  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds: number | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number;

  @Column({ name: 'is_cover', type: 'boolean', default: false })
  isCover!: boolean;

  @ManyToOne(() => Moodboard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'moodboard_id' })
  moodboard?: Moodboard;

  @ManyToOne(() => CommunityMedia, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'community_media_id' })
  communityMedia?: CommunityMedia;
}
