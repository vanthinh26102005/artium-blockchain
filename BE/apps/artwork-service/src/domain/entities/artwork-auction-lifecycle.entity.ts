import { AbstractEntity, SellerAuctionStartStatusObject } from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'artwork_auction_lifecycle_snapshots' })
@Index(['sellerId', 'artworkId'], { unique: true })
export class ArtworkAuctionLifecycleSnapshot extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId!: string;

  @Column({ name: 'artwork_id', type: 'uuid' })
  artworkId!: string;

  @Column({ name: 'attempt_id', type: 'uuid' })
  attemptId!: string;

  @Column({ name: 'order_id', type: 'varchar', length: 64 })
  orderId!: string;

  @Column({ name: 'source_updated_at', type: 'timestamptz' })
  sourceUpdatedAt!: Date;

  @Column({ type: 'jsonb' })
  lifecycle!: SellerAuctionStartStatusObject;
}
