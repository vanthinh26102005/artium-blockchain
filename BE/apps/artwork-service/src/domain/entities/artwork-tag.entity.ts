import { AbstractEntity } from '@app/common';
import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Artwork } from './artworks.entity';
import { Tag } from './tags.entity';

@Entity({ name: 'artwork_tags' })
@Index(['artworkId', 'tagId'], { unique: true })
@Index(['tagId'])
export class ArtworkTag extends AbstractEntity {
  @PrimaryColumn({ name: 'artwork_id', type: 'uuid' })
  artworkId!: string;

  @PrimaryColumn({ name: 'tag_id', type: 'uuid' })
  tagId!: string;

  @ManyToOne(() => Artwork, (artwork) => artwork.tags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artwork_id' })
  artwork!: Artwork;

  @ManyToOne(() => Tag, (tag) => tag.artworkTags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  tag!: Tag;
}
