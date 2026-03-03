import { AbstractEntity, DiscountType } from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'promotions' })
@Index(['sellerId', 'isActive'])
@Index(['code'], { unique: true })
@Index(['startDate', 'endDate'])
export class Promotion extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'promo_id' })
  promoId!: string;

  @Column({ name: 'seller_id', type: 'string' })
  sellerId!: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ name: 'discount_type', type: 'enum', enum: DiscountType })
  discountType!: DiscountType;

  @Column({ name: 'discount_value', type: 'decimal', precision: 12, scale: 2 })
  discountValue!: string;

  @Column({
    name: 'start_date',
    type: 'timestamp with time zone',
    nullable: true,
  })
  startDate?: Date | null;

  @Column({
    name: 'end_date',
    type: 'timestamp with time zone',
    nullable: true,
  })
  endDate?: Date | null;

  @Column({ name: 'max_uses', type: 'int', nullable: true })
  maxUses?: number | null;

  @Column({ name: 'max_uses_per_customer', type: 'int', nullable: true })
  maxUsesPerCustomer?: number | null;

  @Column({ name: 'current_uses', type: 'int', default: 0 })
  currentUses!: number;

  @Column({
    name: 'min_order_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  minOrderAmount?: string | null;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({ name: 'applicable_artwork_ids', type: 'jsonb', nullable: true })
  applicableArtworkIds?: string[] | null;

  @Column({ name: 'eligible_segment_ids', type: 'jsonb', nullable: true })
  eligibleSegmentIds?: string[] | null;

  @Column({ name: 'eligible_customer_ids', type: 'jsonb', nullable: true })
  eligibleCustomerIds?: string[] | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'is_public', type: 'boolean', default: true })
  isPublic!: boolean;

  @Column({
    name: 'total_revenue',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalRevenue!: string;

  @Column({
    name: 'total_discount_given',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalDiscountGiven!: string;

  @Column({ type: 'text', nullable: true })
  internalNotes?: string | null;
}
