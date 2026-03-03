import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'private_view_invitees' })
@Index(['viewId', 'contactId'], {
  unique: true,
  where: 'contact_id IS NOT NULL',
})
@Index(['viewId', 'email'], { unique: true, where: 'email IS NOT NULL' })
@Index(['contactId'])
export class PrivateViewInvitee {
  @PrimaryColumn({ name: 'view_id', type: 'uuid' })
  id!: string;

  @PrimaryColumn({ name: 'contact_id', type: 'uuid' })
  contactId?: string | null;

  @Column({ name: 'email', type: 'varchar', length: 320, nullable: true })
  email?: string | null;

  @Column({ name: 'has_viewed', type: 'boolean', default: false })
  hasViewed!: boolean;

  @Column({ name: 'viewed_at', type: 'timestamp', nullable: true })
  viewedAt?: Date | null;

  @CreateDateColumn({ name: 'invited_at', type: 'timestamp with time zone' })
  invitedAt!: Date;
}
