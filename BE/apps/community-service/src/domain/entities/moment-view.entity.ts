import { AbstractEntity } from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'moment_views' })
@Index(['momentId', 'createdAt'])
@Index(['viewerId'])
@Index(['momentId', 'viewerId'], { unique: true })
export class MomentView extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'view_id' })
  id!: string;

  @Column({ name: 'moment_id', type: 'uuid' })
  momentId!: string;

  @Column({
    name: 'viewer_id',
    type: 'uuid',
    comment: 'User who viewed the moment',
  })
  viewerId!: string;

  @Column({
    name: 'moment_owner_id',
    type: 'uuid',
    comment: 'Owner of the moment for easy querying',
  })
  momentOwnerId!: string;

  @Column({
    name: 'view_duration_seconds',
    type: 'int',
    nullable: true,
    comment: 'How long they viewed it',
  })
  viewDurationSeconds?: number | null;

  @Column({
    name: 'viewed_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  viewedAt!: Date;

  @Column({
    name: 'source',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'web, mobile, etc.',
  })
  source?: string | null;

  @Column({ name: 'liked', type: 'boolean', default: false })
  liked!: boolean;

  @Column({ name: 'commented', type: 'boolean', default: false })
  commented!: boolean;

  @Column({ name: 'shared', type: 'boolean', default: false })
  shared!: boolean;
}
