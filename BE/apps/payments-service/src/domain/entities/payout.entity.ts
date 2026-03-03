import { AbstractEntity } from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum PayoutStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum PayoutProvider {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
}

@Entity({ name: 'payouts' })
@Index(['sellerId', 'status'])
@Index(['createdAt'])
export class Payout extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'payout_id' })
  id!: string;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId!: string;

  @Column({
    type: 'enum',
    enum: PayoutStatus,
    default: PayoutStatus.PENDING,
  })
  status!: PayoutStatus;

  @Column({
    type: 'enum',
    enum: PayoutProvider,
    comment: 'Provider used for payout',
  })
  provider!: PayoutProvider;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({
    name: 'transaction_fee',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  transactionFee?: number | null;

  @Column({
    name: 'net_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    comment: 'Amount seller receives',
  })
  netAmount!: number;

  @Column({
    name: 'stripe_payout_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  stripePayoutId?: string | null;

  @Column({
    name: 'stripe_account_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  stripeAccountId?: string | null;

  @Column({
    name: 'paypal_payout_batch_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  paypalPayoutBatchId?: string | null;

  @Column({
    name: 'paypal_payout_item_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  paypalPayoutItemId?: string | null;

  @Column({
    name: 'transaction_ids',
    type: 'jsonb',
    nullable: true,
    comment: 'Array of transaction IDs included in payout',
  })
  transactionIds?: string[] | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason?: string | null;

  @Column({
    name: 'failure_code',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  failureCode?: string | null;

  @Column({ name: 'scheduled_at', type: 'timestamp', nullable: true })
  scheduledAt?: Date | null;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt?: Date | null;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt?: Date | null;

  @Column({
    name: 'arrival_date',
    type: 'timestamp',
    nullable: true,
    comment: 'Expected arrival date in seller account',
  })
  arrivalDate?: Date | null;
}
