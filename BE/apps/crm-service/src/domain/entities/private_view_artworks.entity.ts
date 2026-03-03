import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { PrivateView } from './private_views.entity';

@Entity({ name: 'private_view_artworks' })
@Index(['viewId', 'artworkId'], { unique: true })
@Index(['viewId', 'displayOrder'])
export class PrivateViewArtwork {
  @PrimaryColumn('uuid', { name: 'view_id' })
  id!: string;

  @PrimaryColumn({ name: 'artwork_id', type: 'string' })
  artworkId!: string;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured!: boolean;

  @Column({
    name: 'special_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  specialPrice?: string | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount!: number;

  @Column({ name: 'inquiry_count', type: 'int', default: 0 })
  inquiryCount!: number;

  @Column({ name: 'was_purchased', type: 'boolean', default: false })
  wasPurchased!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => PrivateView, (view) => view.artworks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'view_id' })
  privateView?: PrivateView;
}
