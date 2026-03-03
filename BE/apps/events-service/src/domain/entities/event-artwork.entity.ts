import { AbstractEntity } from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'event_artworks' })
@Index(['eventId'])
@Index(['artworkId'])
@Index(['eventId', 'artworkId'], { unique: true })
export class EventArtwork extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'event_artwork_id' })
  id!: string;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId!: string;

  @Column({ name: 'artwork_id', type: 'uuid' })
  artworkId!: string;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured!: boolean;

  @Column({
    name: 'event_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  eventPrice?: string | null;

  @Column({
    name: 'price_currency',
    type: 'varchar',
    length: 3,
    nullable: true,
  })
  priceCurrency?: string | null;

  @Column({ name: 'is_available_for_sale', type: 'boolean', default: true })
  isAvailableForSale!: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount!: number;

  @Column({ name: 'inquiry_count', type: 'int', default: 0 })
  inquiryCount!: number;
}
