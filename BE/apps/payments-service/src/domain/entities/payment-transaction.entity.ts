import { AbstractEntity, EscrowState } from '@app/common';
import {
  PaymentProvider,
  TransactionStatus,
  TransactionType,
} from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'payment_transactions' })
@Index(['orderId'])
@Index(['invoiceId'])
@Index(['userId', 'createdAt'])
@Index(['sellerId', 'createdAt'])
@Index(['status', 'provider'])
export class PaymentTransaction extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'transaction_id' })
  id!: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
    comment: 'Type of transaction',
  })
  type!: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  @Column({
    type: 'enum',
    enum: PaymentProvider,
    comment: 'Payment provider used',
  })
  provider!: PaymentProvider;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'seller_id', type: 'uuid', nullable: true })
  sellerId?: string | null;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId?: string | null;

  @Column({ name: 'invoice_id', type: 'uuid', nullable: true })
  invoiceId?: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({
    name: 'platform_fee',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  platformFee?: number | null;

  @Column({
    name: 'net_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  netAmount?: number | null;

  @Column({
    name: 'stripe_payment_intent_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  stripePaymentIntentId?: string | null;

  @Column({
    name: 'stripe_charge_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  stripeChargeId?: string | null;

  @Column({
    name: 'paypal_order_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  paypalOrderId?: string | null;

  @Column({
    name: 'paypal_capture_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  paypalCaptureId?: string | null;

  @Column({ name: 'payment_method_id', type: 'uuid', nullable: true })
  paymentMethodId?: string | null;

  @Column({
    name: 'payment_method_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  paymentMethodType?: string | null;

  @Column({
    name: 'payment_method_last_four',
    type: 'varchar',
    length: 4,
    nullable: true,
  })
  paymentMethodLastFour?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason?: string | null;

  @Column({
    name: 'failure_code',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  failureCode?: string | null;

  @Column({
    name: 'refund_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  refundAmount?: number | null;

  @Column({ name: 'refund_reason', type: 'text', nullable: true })
  refundReason?: string | null;

  @Column({ name: 'refunded_at', type: 'timestamp', nullable: true })
  refundedAt?: Date | null;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt?: Date | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date | null;

  // ── Blockchain/escrow fields ──

  @Column({
    name: 'escrow_state',
    type: 'enum',
    enum: EscrowState,
    nullable: true,
    comment: 'On-chain escrow state for blockchain transactions',
  })
  escrowState?: EscrowState | null;

  @Column({
    name: 'tx_hash',
    type: 'varchar',
    length: 66,
    nullable: true,
    comment: 'Blockchain transaction hash',
  })
  txHash?: string | null;

  @Column({
    name: 'wallet_address',
    type: 'varchar',
    length: 42,
    nullable: true,
    comment: 'Ethereum wallet address',
  })
  walletAddress?: string | null;
}
