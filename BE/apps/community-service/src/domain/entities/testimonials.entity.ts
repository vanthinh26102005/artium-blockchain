import { AbstractEntity } from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'testimonials' })
@Index(['artworkId', 'isApproved'])
@Index(['buyerId', 'artworkId'], { unique: true })
@Index(['sellerId', 'rating'])
export class Testimonial extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'testimonial_id' })
  id!: string;

  @Column({ name: 'buyer_id', type: 'uuid' })
  buyerId!: string;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId!: string;

  @Column({ name: 'artwork_id', type: 'uuid' })
  artworkId!: string;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string | null;

  @Column({ type: 'smallint' })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @Column({ name: 'buyer_name', type: 'varchar', length: 255, nullable: true })
  buyerName: string | null;

  @Column({
    name: 'artwork_title',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  artworkTitle: string | null;

  @Column({ name: 'is_approved', type: 'boolean', default: false })
  isApproved!: boolean;

  @Column({ name: 'is_visible', type: 'boolean', default: true })
  isVisible!: boolean;

  @Column({ name: 'is_flagged', type: 'boolean', default: false })
  isFlagged!: boolean;

  @Column({ name: 'flag_reason', type: 'text', nullable: true })
  flagReason: string | null;

  @Column({ name: 'seller_response', type: 'text', nullable: true })
  sellerResponse: string | null;

  @Column({ name: 'seller_responded_at', type: 'timestamp', nullable: true })
  sellerRespondedAt: Date | null;

  @Column({ name: 'helpful_count', type: 'int', default: 0 })
  helpfulCount!: number;

  @Column({ name: 'not_helpful_count', type: 'int', default: 0 })
  notHelpfulCount!: number;

  @Column({ name: 'is_verified_purchase', type: 'boolean', default: false })
  isVerifiedPurchase!: boolean;

  @Column({ name: 'review_images', type: 'jsonb', nullable: true })
  reviewImages: string[] | null;

  @Column({ name: 'detailed_ratings', type: 'jsonb', nullable: true })
  detailedRatings: {
    accuracy: number;
    communication: number;
    shipping: number;
    value: number;
  } | null;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string | null;
}
