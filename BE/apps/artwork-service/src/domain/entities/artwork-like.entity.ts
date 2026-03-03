import { AbstractEntity } from '@app/common';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Artwork } from './artworks.entity';

@Entity({ name: 'artwork_likes' })
@Index(['userId', 'artworkId'], { unique: true })
@Index(['artworkId', 'createdAt'])
@Index(['sellerId', 'createdAt'])
@Index(['userId', 'createdAt'])
export class ArtworkLike extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'like_id' })
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'artwork_id', type: 'uuid' })
  artworkId!: string;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId!: string;

  @ManyToOne(() => Artwork, (artwork) => artwork.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artwork_id' })
  artwork!: Artwork;
}
