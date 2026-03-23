import {
  AbstractEntity,
  EscrowState,
  OrderPaymentMethod,
  OrderPaymentStatus,
  OrderStatus,
} from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'orders' })
@Index(['collectorId', 'status'])
@Index(['createdAt'])
export class Order extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'order_id' })
  id!: string;

  @Column({ name: 'collector_id', type: 'uuid', nullable: true })
  collectorId?: string | null;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Column({ name: 'order_number', type: 'varchar', length: 50, unique: true })
  orderNumber!: string;

  @Column({ name: 'subtotal', type: 'decimal', precision: 12, scale: 2 })
  subtotal!: number;

  @Column({
    name: 'shipping_cost',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  shippingCost!: number;

  @Column({
    name: 'tax_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  taxAmount!: number;

  @Column({
    name: 'discount_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    nullable: true,
  })
  discountAmount?: number | null;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  totalAmount!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({ name: 'promo_code', type: 'varchar', length: 50, nullable: true })
  promoCode?: string | null;

  @Column({ name: 'shipping_address', type: 'jsonb', nullable: true })
  shippingAddress?: {
    fullName?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  } | null;

  @Column({ name: 'billing_address', type: 'jsonb', nullable: true })
  billingAddress?: {
    fullName?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  } | null;

  @Column({
    name: 'shipping_method',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  shippingMethod?: string | null;

  @Column({
    name: 'tracking_number',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  trackingNumber?: string | null;

  @Column({ name: 'carrier', type: 'varchar', length: 100, nullable: true })
  carrier?: string | null;

  @Column({
    name: 'estimated_delivery_date',
    type: 'timestamp',
    nullable: true,
  })
  estimatedDeliveryDate?: Date | null;

  @Column({ name: 'payment_transaction_id', type: 'uuid', nullable: true })
  paymentTransactionId?: string | null;

  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  paymentMethod?: OrderPaymentMethod | null;

  @Column({
    name: 'payment_status',
    type: 'varchar',
    length: 50,
    default: OrderPaymentStatus.UNPAID,
  })
  paymentStatus!: OrderPaymentStatus;

  @Column({ name: 'payment_intent_id', type: 'varchar', nullable: true })
  paymentIntentId?: string | null;

  @Column({ name: 'customer_notes', type: 'text', nullable: true })
  customerNotes?: string | null;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes?: string | null;

  @Column({ name: 'cancelled_reason', type: 'text', nullable: true })
  cancelledReason?: string | null;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt?: Date | null;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt?: Date | null;

  @Column({ name: 'shipped_at', type: 'timestamp', nullable: true })
  shippedAt?: Date | null;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt?: Date | null;

  @Column({ name: 'on_chain_order_id', type: 'varchar', nullable: true, unique: true })
  onChainOrderId?: string | null;

  @Column({ name: 'contract_address', type: 'varchar', length: 42, nullable: true })
  contractAddress?: string | null;

  @Column({ name: 'escrow_state', type: 'smallint', nullable: true })
  escrowState?: EscrowState | null;

  @Column({ name: 'tx_hash', type: 'varchar', length: 66, nullable: true })
  txHash?: string | null;

  @Column({ name: 'seller_wallet', type: 'varchar', length: 42, nullable: true })
  sellerWallet?: string | null;

  @Column({ name: 'buyer_wallet', type: 'varchar', length: 42, nullable: true })
  buyerWallet?: string | null;

  @Column({ name: 'bid_amount_wei', type: 'varchar', length: 78, nullable: true })
  bidAmountWei?: string | null;
}
