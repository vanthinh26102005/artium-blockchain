import { AbstractEntity } from '@app/common';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'moodboard_collaborators' })
@Index(['moodboardId', 'userId'], { unique: true })
@Index(['userId'])
export class MoodboardCollaborator extends AbstractEntity {
  @PrimaryColumn({ name: 'moodboard_id', type: 'uuid' })
  moodboardId!: string;

  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'role', type: 'varchar', length: 50, default: 'EDITOR' })
  role!: string;

  @Column({ name: 'can_edit', type: 'boolean', default: true })
  canEdit!: boolean;

  @Column({ name: 'can_invite', type: 'boolean', default: false })
  canInvite!: boolean;

  @Column({ name: 'invited_at', type: 'timestamp' })
  invitedAt!: Date;

  @Column({ name: 'invited_by', type: 'uuid' })
  invitedBy!: string;
}
