import {
  AbstractEntity,
  SellerAuctionStartFailureReason,
  SellerAuctionStartStatus,
  SellerAuctionReservePolicy,
} from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type SellerAuctionStartTermsSnapshot = {
  reservePolicy: SellerAuctionReservePolicy;
  reservePriceEth?: string | null;
  minBidIncrementEth: string;
  durationHours: number;
  shippingDisclosure: string;
  paymentDisclosure: string;
  economicsLockedAcknowledged: boolean;
};

@Entity({ name: 'auction_start_attempts' })
@Index(['sellerId', 'artworkId'])
@Index(['orderId'], { unique: true })
export class AuctionStartAttempt extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'auction_start_attempt_id' })
  id!: string;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId!: string;

  @Column({ name: 'artwork_id', type: 'uuid' })
  artworkId!: string;

  @Column({ name: 'order_id', type: 'varchar', length: 64 })
  orderId!: string;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 50,
    default: SellerAuctionStartStatus.PENDING_START,
  })
  status!: SellerAuctionStartStatus;

  @Column({ name: 'artwork_title', type: 'varchar', length: 500 })
  artworkTitle!: string;

  @Column({ name: 'creator_name', type: 'varchar', length: 255, nullable: true })
  creatorName?: string | null;

  @Column({
    name: 'thumbnail_url',
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  thumbnailUrl?: string | null;

  @Column({ name: 'wallet_address', type: 'varchar', length: 42, nullable: true })
  walletAddress?: string | null;

  @Column({ name: 'contract_address', type: 'varchar', length: 42, nullable: true })
  contractAddress?: string | null;

  @Column({ name: 'tx_hash', type: 'varchar', length: 66, nullable: true, unique: true })
  txHash?: string | null;

  @Column({
    name: 'reason_code',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  reasonCode?: SellerAuctionStartFailureReason | null;

  @Column({ name: 'reason_message', type: 'text', nullable: true })
  reasonMessage?: string | null;

  @Column({ name: 'retry_allowed', type: 'boolean', default: false })
  retryAllowed!: boolean;

  @Column({ name: 'edit_allowed', type: 'boolean', default: false })
  editAllowed!: boolean;

  @Column({ name: 'wallet_action_required', type: 'boolean', default: true })
  walletActionRequired!: boolean;

  @Column({ name: 'activated_at', type: 'timestamp', nullable: true })
  activatedAt?: Date | null;

  @Column({ name: 'duration_seconds', type: 'integer' })
  durationSeconds!: number;

  @Column({ name: 'reserve_price_wei', type: 'varchar', length: 78 })
  reservePriceWei!: string;

  @Column({ name: 'min_bid_increment_wei', type: 'varchar', length: 78 })
  minBidIncrementWei!: string;

  @Column({ name: 'ipfs_metadata_hash', type: 'varchar', length: 255 })
  ipfsMetadataHash!: string;

  @Column({ name: 'terms_snapshot', type: 'jsonb' })
  termsSnapshot!: SellerAuctionStartTermsSnapshot;
}
