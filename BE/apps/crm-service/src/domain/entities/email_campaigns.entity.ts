import { AbstractEntity } from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  SENDING = 'SENDING',
  SENT = 'SENT',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
}

export enum CampaignType {
  NEWSLETTER = 'NEWSLETTER',
  PROMOTIONAL = 'PROMOTIONAL',
  EVENT_INVITATION = 'EVENT_INVITATION',
  PRODUCT_LAUNCH = 'PRODUCT_LAUNCH',
  ABANDONED_CART = 'ABANDONED_CART',
  FOLLOW_UP = 'FOLLOW_UP',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
}

@Entity({ name: 'email_campaigns' })
@Index(['sellerId', 'status'])
@Index(['scheduledAt'])
export class EmailCampaign extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'campaign_id' })
  id!: string;

  @Column({ name: 'seller_id', type: 'string' })
  sellerId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({
    type: 'enum',
    enum: CampaignType,
    default: CampaignType.NEWSLETTER,
  })
  type!: CampaignType;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT,
  })
  status!: CampaignStatus;

  @Column({ type: 'varchar', length: 512, nullable: true })
  subject?: string | null;

  @Column({
    name: 'preview_text',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  previewText?: string | null;

  @Column({ name: 'body_html', type: 'text', nullable: true })
  bodyHtml?: string | null;

  @Column({ name: 'body_text', type: 'text', nullable: true })
  bodyText?: string | null;

  @Column({ name: 'from_name', type: 'varchar', length: 255, nullable: true })
  fromName?: string | null;

  @Column({ name: 'from_email', type: 'varchar', length: 320, nullable: true })
  fromEmail?: string | null;

  @Column({ name: 'reply_to', type: 'varchar', length: 320, nullable: true })
  replyTo?: string | null;

  @Column({
    name: 'segment_ids',
    type: 'jsonb',
    nullable: true,
    comment: 'Array of customer segment IDs to target',
  })
  segmentIds?: string[] | null;

  @Column({
    name: 'contact_ids',
    type: 'jsonb',
    nullable: true,
    comment: 'Specific contact IDs if not using segments',
  })
  contactIds?: string[] | null;

  @Column({ name: 'total_recipients', type: 'int', default: 0 })
  totalRecipients!: number;

  @Column({ name: 'scheduled_at', type: 'timestamp', nullable: true })
  scheduledAt?: Date | null;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt?: Date | null;

  @Column({ name: 'emails_sent', type: 'int', default: 0 })
  emailsSent!: number;

  @Column({ name: 'emails_delivered', type: 'int', default: 0 })
  emailsDelivered!: number;

  @Column({ name: 'emails_opened', type: 'int', default: 0 })
  emailsOpened!: number;

  @Column({ name: 'unique_opens', type: 'int', default: 0 })
  uniqueOpens!: number;

  @Column({ name: 'emails_clicked', type: 'int', default: 0 })
  emailsClicked!: number;

  @Column({ name: 'unique_clicks', type: 'int', default: 0 })
  uniqueClicks!: number;

  @Column({ name: 'emails_bounced', type: 'int', default: 0 })
  emailsBounced!: number;

  @Column({ name: 'unsubscribes', type: 'int', default: 0 })
  unsubscribes!: number;

  @Column({ name: 'complaints', type: 'int', default: 0 })
  complaints!: number;

  @Column({ name: 'is_ab_test', type: 'boolean', default: false })
  isAbTest!: boolean;

  @Column({ name: 'ab_test_config', type: 'jsonb', nullable: true })
  abTestConfig?: {
    variantA?: string;
    variantB?: string;
    splitPercentage?: number;
    winningMetric?: 'opens' | 'clicks' | 'conversions';
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;
}
