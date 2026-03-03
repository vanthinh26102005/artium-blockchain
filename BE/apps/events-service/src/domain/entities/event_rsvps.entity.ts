import { AbstractEntity, RSVPStatus } from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'event_rsvps' })
@Index(['eventId', 'status'])
@Index(['userId'])
@Index(['eventId', 'userId'], { unique: true })
export class EventRsvp extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'rsvp_id' })
  id!: string;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'enum', enum: RSVPStatus, default: RSVPStatus.PENDING })
  status!: RSVPStatus;

  @Column({ name: 'invited_by_user_id', type: 'uuid', nullable: true })
  invitedByUserId: string | null;

  @Column({ name: 'guest_name', type: 'varchar', length: 255, nullable: true })
  guestName?: string | null;

  @Column({ name: 'guest_email', type: 'varchar', length: 320, nullable: true })
  guestEmail?: string | null;

  @Column({ name: 'guest_phone', type: 'varchar', length: 50, nullable: true })
  guestPhone?: string | null;

  @Column({ name: 'number_of_guests', type: 'smallint', default: 1 })
  numberOfGuests!: number;

  @Column({ name: 'dietary_restrictions', type: 'text', nullable: true })
  dietaryRestrictions?: string | null;

  @Column({ name: 'special_requests', type: 'text', nullable: true })
  specialRequests?: string | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ name: 'checked_in', type: 'boolean', default: false })
  checkedIn!: boolean;

  @Column({ name: 'checked_in_at', type: 'timestamp', nullable: true })
  checkedInAt?: Date | null;

  @Column({ name: 'reminder_sent', type: 'boolean', default: false })
  reminderSent!: boolean;

  @Column({ name: 'reminder_sent_at', type: 'timestamp', nullable: true })
  reminderSentAt?: Date | null;

  @Column({ name: 'responded_at', type: 'timestamp', nullable: true })
  respondedAt?: Date | null;
}
