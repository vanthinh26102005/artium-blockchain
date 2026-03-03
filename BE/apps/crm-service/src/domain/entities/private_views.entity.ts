import { AbstractEntity } from '@app/common';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PrivateViewArtwork } from './private_view_artworks.entity';

@Entity({ name: 'private_views' })
@Index(['sellerId', 'expiresAt'])
@Index(['accessToken'], { unique: true })
export class PrivateView extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'view_id' })
  viewId!: string;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ name: 'access_token', type: 'varchar', length: 512, unique: true })
  accessToken!: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  passwordHash?: string | null;

  @Column({ name: 'is_password_protected', type: 'boolean', default: false })
  isPasswordProtected!: boolean;

  @Column({
    name: 'expires_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  expiresAt?: Date | null;

  @Column({ name: 'max_views', type: 'int', nullable: true })
  maxViews?: number | null;

  @Column({ name: 'current_views', type: 'int', default: 0 })
  currentViews!: number;

  @Column({ name: 'show_prices', type: 'boolean', default: true })
  showPrices!: boolean;

  @Column({ name: 'allow_inquiries', type: 'boolean', default: true })
  allowInquiries!: boolean;

  @Column({ name: 'allow_purchases', type: 'boolean', default: false })
  allowPurchases!: boolean;

  @Column({ name: 'welcome_message', type: 'text', nullable: true })
  welcomeMessage?: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'unique_visitors', type: 'int', default: 0 })
  uniqueVisitors!: number;

  @Column({ name: 'inquiry_count', type: 'int', default: 0 })
  inquiryCount!: number;

  @Column({ name: 'purchase_count', type: 'int', default: 0 })
  purchaseCount!: number;

  @Column({
    name: 'total_revenue',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalRevenue!: string;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @OneToMany(() => PrivateViewArtwork, (artwork) => artwork.privateView, {
    cascade: true,
  })
  artworks?: PrivateViewArtwork[];
}
