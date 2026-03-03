import { AbstractEntity } from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'moodboards' })
@Index(['userId', 'isPrivate'])
export class Moodboard extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'moodboard_id' })
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    name: 'cover_image_url',
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  coverImageUrl: string | null;

  @Column({ name: 'is_private', type: 'boolean', default: false })
  isPrivate!: boolean;

  @Column({ name: 'artwork_count', type: 'int', default: 0 })
  artworkCount!: number;

  @Column({ name: 'like_count', type: 'int', default: 0 })
  likeCount!: number;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount!: number;

  @Column({ name: 'share_count', type: 'int', default: 0 })
  shareCount!: number;

  @Column({ name: 'is_collaborative', type: 'boolean', default: false })
  isCollaborative!: boolean;

  @Column({
    name: 'collaborator_ids',
    type: 'jsonb',
    nullable: true,
    comment: 'Array of user IDs who can edit',
  })
  collaboratorIds: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[] | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number;
}
