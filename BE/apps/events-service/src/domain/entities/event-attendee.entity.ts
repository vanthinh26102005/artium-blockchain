import { AbstractEntity } from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'event_attendees' })
@Index(['eventId', 'checkedInAt'])
@Index(['userId'])
export class EventAttendee extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'attendee_id' })
  id!: string;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string | null;

  @Column({ name: 'rsvp_id', type: 'uuid', nullable: true })
  rsvpId?: string | null;

  @Column({
    name: 'walk_in_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  walkInName?: string | null;

  @Column({
    name: 'walk_in_email',
    type: 'varchar',
    length: 320,
    nullable: true,
  })
  walkInEmail?: string | null;

  @Column({
    name: 'walk_in_phone',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  walkInPhone?: string | null;

  @Column({
    name: 'checked_in_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  checkedInAt!: Date;

  @Column({
    name: 'checked_in_by',
    type: 'uuid',
    nullable: true,
    comment: 'Staff/organizer who checked in the attendee',
  })
  checkedInBy?: string | null;

  @Column({
    name: 'check_in_method',
    type: 'varchar',
    length: 50,
    default: 'MANUAL',
  })
  checkInMethod!: string;

  @Column({ name: 'number_of_guests', type: 'smallint', default: 1 })
  numberOfGuests!: number;

  @Column({
    name: 'duration_minutes',
    type: 'int',
    nullable: true,
    comment: 'How long they stayed',
  })
  durationMinutes?: number | null;

  @Column({
    name: 'artworks_viewed',
    type: 'jsonb',
    nullable: true,
    comment: 'Array of artwork IDs viewed',
  })
  artworksViewed?: string[] | null;

  @Column({ name: 'inquiries_made', type: 'int', default: 0 })
  inquiriesMade!: number;

  @Column({ name: 'purchases_made', type: 'int', default: 0 })
  purchasesMade!: number;

  @Column({ type: 'text', nullable: true })
  feedback?: string | null;

  @Column({ type: 'smallint', nullable: true, comment: 'Rating 1-5' })
  rating?: number | null;

  @Column({ name: 'opt_in_marketing', type: 'boolean', default: false })
  optInMarketing!: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;
}
