import { AbstractEntity } from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum ContactStatus {
  ACTIVE = 'ACTIVE',
  UNSUBSCRIBED = 'UNSUBSCRIBED',
  BOUNCED = 'BOUNCED',
  COMPLAINED = 'COMPLAINED',
}

export enum ContactSource {
  MANUAL_IMPORT = 'MANUAL_IMPORT',
  EVENT_REGISTRATION = 'EVENT_REGISTRATION',
  WEBSITE_SIGNUP = 'WEBSITE_SIGNUP',
  PURCHASE = 'PURCHASE',
  INQUIRY = 'INQUIRY',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
}

@Entity({ name: 'contacts' })
@Index(['sellerId', 'email'], { unique: true })
@Index(['sellerId', 'status'])
@Index(['email'])
export class Contact extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'contact_id' })
  id!: string;

  @Column({ name: 'seller_id', type: 'string' })
  sellerId!: string;

  @Column({ type: 'varchar', length: 320 })
  email!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 128, nullable: true })
  firstName?: string | null;

  @Column({ name: 'last_name', type: 'varchar', length: 128, nullable: true })
  lastName?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  company?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  jobTitle?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  } | null;

  @Column({
    type: 'enum',
    enum: ContactStatus,
    default: ContactStatus.ACTIVE,
  })
  status!: ContactStatus;

  @Column({
    type: 'enum',
    enum: ContactSource,
    nullable: true,
  })
  source?: ContactSource | null;

  @Column({ name: 'opt_in_email', type: 'boolean', default: true })
  optInEmail!: boolean;

  @Column({ name: 'opt_in_sms', type: 'boolean', default: false })
  optInSms!: boolean;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Array of tag/segment IDs',
  })
  tags?: string[] | null;

  @Column({ name: 'customer_segment_ids', type: 'jsonb', nullable: true })
  customerSegmentIds?: string[] | null;

  @Column({ name: 'email_opens', type: 'int', default: 0 })
  emailOpens!: number;

  @Column({ name: 'email_clicks', type: 'int', default: 0 })
  emailClicks!: number;

  @Column({ name: 'last_email_sent_at', type: 'timestamp', nullable: true })
  lastEmailSentAt?: Date | null;

  @Column({ name: 'last_email_opened_at', type: 'timestamp', nullable: true })
  lastEmailOpenedAt?: Date | null;

  @Column({ name: 'total_purchases', type: 'int', default: 0 })
  totalPurchases!: number;

  @Column({
    name: 'total_spent',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalSpent!: string;

  @Column({ name: 'last_purchase_at', type: 'timestamp', nullable: true })
  lastPurchaseAt?: Date | null;

  @Column({
    name: 'engagement_score',
    type: 'int',
    default: 0,
    comment: 'Calculated engagement score 0-100',
  })
  engagementScore!: number;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: Record<string, any> | null;

  @Column({ name: 'unsubscribed_at', type: 'timestamp', nullable: true })
  unsubscribedAt?: Date | null;
}
