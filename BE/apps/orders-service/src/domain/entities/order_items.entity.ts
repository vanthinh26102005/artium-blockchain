import { AbstractEntity, PayoutStatus } from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'order_items' })
@Index(['orderId'])
@Index(['artworkId'])
@Index(['sellerId'])
export class OrderItem extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'order_item_id' })
  id!: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId!: string;

  @Column({ name: 'artwork_id', type: 'uuid' })
  artworkId!: string;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId!: string;

  @Column({
    name: 'price_at_purchase',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  priceAtPurchase!: number;

  @Column({ type: 'smallint', default: 1 })
  quantity!: number;

  @Column({ name: 'currency', type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({ name: 'artwork_title', type: 'varchar', length: 500 })
  artworkTitle!: string;

  @Column({
    name: 'artwork_image_url',
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  artworkImageUrl?: string | null;

  @Column({ name: 'artwork_description', type: 'text', nullable: true })
  artworkDescription?: string | null;

  @Column({
    name: 'platform_fee',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  platformFee?: string | null;

  @Column({
    name: 'seller_payout_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  sellerPayoutAmount?: string | null;

  @Column({
    name: 'payout_status',
    type: 'varchar',
    length: 50,
    default: 'PENDING',
  })
  payoutStatus!: PayoutStatus;

  @Column({ name: 'payout_at', type: 'timestamp', nullable: true })
  payoutAt?: Date | null;
}
