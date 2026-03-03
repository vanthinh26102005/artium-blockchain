import { AbstractEntity } from '@app/common';
import { EventStatus, EventType } from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'events' })
@Index(['creatorId', 'status'])
@Index(['startTime'])
@Index(['isPublic', 'status'])
export class Event extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'event_id' })
  id!: string;

  @Column({ name: 'creator_id', type: 'uuid' })
  creatorId!: string;

  @Column({ type: 'varchar', length: 512 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: EventType,
    default: EventType.EXHIBITION,
  })
  type!: EventType;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status!: EventStatus;

  @Column({
    name: 'start_time',
    type: 'timestamp with time zone',
    nullable: true,
  })
  startTime?: Date;

  @Column({
    name: 'end_time',
    type: 'timestamp with time zone',
    nullable: true,
  })
  endTime?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  timezone?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  location?: {
    type?: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';
    venueName?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
    virtualUrl?: string;
    accessInstructions?: string;
  } | null;

  @Column({
    name: 'cover_image_url',
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  coverImageUrl?: string | null;

  @Column({ name: 'gallery_images', type: 'jsonb', nullable: true })
  galleryImages?: string[] | null;

  @Column({ name: 'requires_registration', type: 'boolean', default: false })
  requiresRegistration!: boolean;

  @Column({ name: 'max_attendees', type: 'int', nullable: true })
  maxAttendees?: number | null;

  @Column({ name: 'registration_deadline', type: 'timestamp', nullable: true })
  registrationDeadline?: Date | null;

  @Column({ name: 'attendee_count', type: 'int', default: 0 })
  attendeeCount!: number;

  @Column({ name: 'is_public', type: 'boolean', default: true })
  isPublic!: boolean;

  @Column({ name: 'invite_only', type: 'boolean', default: false })
  inviteOnly!: boolean;

  @Column({ name: 'access_code', type: 'varchar', length: 50, nullable: true })
  accessCode?: string | null;

  @Column({ name: 'is_free', type: 'boolean', default: true })
  isFree!: boolean;

  @Column({
    name: 'ticket_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  ticketPrice?: string | null;

  @Column({ type: 'varchar', length: 3, nullable: true })
  currency?: string | null;

  @Column({
    name: 'external_url',
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  externalUrl?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  tags?: string[] | null;

  @Column({
    name: 'contact_email',
    type: 'varchar',
    length: 320,
    nullable: true,
  })
  contactEmail?: string | null;

  @Column({
    name: 'contact_phone',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  contactPhone?: string | null;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason?: string | null;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt?: Date | null;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt?: Date | null;
}
