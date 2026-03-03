import { AbstractEntity } from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * CampaignRecipient
 * Tracks individual email sends and engagement metrics
 */

export enum DeliveryStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  BOUNCED = 'BOUNCED',
  FAILED = 'FAILED',
}

@Entity({ name: 'campaign_recipients' })
@Index(['campaignId', 'contactId'], { unique: true })
@Index(['campaignId', 'deliveryStatus'])
@Index(['contactId'])
export class CampaignRecipient extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'recipient_id' })
  id!: string;

  @Column({ name: 'campaign_id', type: 'string' })
  campaignId!: string;

  @Column({ name: 'contact_id', type: 'string' })
  contactId!: string;

  @Column({ name: 'email', type: 'varchar', length: 320 })
  email!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
  fullName?: string | null;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
    name: 'delivery_status',
  })
  deliveryStatus!: DeliveryStatus;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt?: Date | null;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt?: Date | null;

  @Column({ name: 'bounce_reason', type: 'text', nullable: true })
  bounceReason?: string | null;

  @Column({ name: 'bounce_type', type: 'varchar', length: 50, nullable: true })
  bounceType?: string | null;

  @Column({ name: 'opened', type: 'boolean', default: false })
  opened!: boolean;

  @Column({ name: 'open_count', type: 'int', default: 0 })
  openCount!: number;

  @Column({ name: 'first_opened_at', type: 'timestamp', nullable: true })
  firstOpenedAt?: Date | null;

  @Column({ name: 'last_opened_at', type: 'timestamp', nullable: true })
  lastOpenedAt?: Date | null;

  @Column({ name: 'clicked', type: 'boolean', default: false })
  clicked!: boolean;

  @Column({ name: 'click_count', type: 'int', default: 0 })
  clickCount!: number;

  @Column({ name: 'first_clicked_at', type: 'timestamp', nullable: true })
  firstClickedAt?: Date | null;

  @Column({ name: 'last_clicked_at', type: 'timestamp', nullable: true })
  lastClickedAt?: Date | null;

  @Column({
    name: 'links_clicked',
    type: 'jsonb',
    nullable: true,
    comment: 'Array of clicked link URLs',
  })
  linksClicked?: string[] | null;

  @Column({ name: 'unsubscribed', type: 'boolean', default: false })
  unsubscribed!: boolean;

  @Column({ name: 'unsubscribed_at', type: 'timestamp', nullable: true })
  unsubscribedAt?: Date | null;

  @Column({ name: 'complained', type: 'boolean', default: false })
  complained!: boolean;

  @Column({ name: 'complained_at', type: 'timestamp', nullable: true })
  complainedAt?: Date | null;

  @Column({
    name: 'converted',
    type: 'boolean',
    default: false,
    comment: 'Made a purchase after receiving email',
  })
  converted!: boolean;

  @Column({
    name: 'conversion_value',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  conversionValue?: string | null;

  @Column({ name: 'converted_at', type: 'timestamp', nullable: true })
  convertedAt?: Date | null;

  @Column({
    name: 'variant',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: 'A/B test variant (A, B, etc.)',
  })
  variant?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;
}
