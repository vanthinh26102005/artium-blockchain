import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Moodboard } from './moodboards.entity';
import { AbstractEntity } from '@app/common';

@Entity({ name: 'moodboard_artworks' })
@Index(['id', 'artworkId'], { unique: true })
@Index(['id', 'displayOrder'])
@Index(['artworkId'])
export class MoodboardArtwork extends AbstractEntity {
  @PrimaryColumn('uuid', { name: 'moodboard_id' })
  id!: string;

  @PrimaryColumn({ name: 'artwork_id', type: 'uuid' })
  artworkId!: string;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  tags?: string[] | null;

  @Column({ name: 'is_favorite', type: 'boolean', default: false })
  isFavorite!: boolean;

  @Column({
    name: 'artwork_title',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  artworkTitle?: string | null;

  @Column({
    name: 'artwork_image_url',
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  artworkImageUrl?: string | null;

  @Column({
    name: 'artwork_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  artworkPrice?: string | null;

  @Column({ name: 'artwork_seller_id', type: 'uuid', nullable: true })
  artworkSellerId?: string | null;

  @Column({
    name: 'availability_status',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  availabilityStatus?: string | null;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount!: number;

  @Column({ name: 'has_inquired', type: 'boolean', default: false })
  hasInquired!: boolean;

  @Column({ name: 'was_purchased', type: 'boolean', default: false })
  wasPurchased!: boolean;

  @ManyToOne(() => Moodboard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'moodboard_id' })
  moodboard?: Moodboard;
}
