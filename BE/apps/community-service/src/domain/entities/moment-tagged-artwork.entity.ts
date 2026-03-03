import { AbstractEntity } from '@app/common';
import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'moment_tagged_artworks' })
@Index(['momentId', 'artworkId'], { unique: true })
@Index(['artworkId'])
@Index(['momentId', 'displayOrder'])
export class MomentTaggedArtwork extends AbstractEntity {
  @PrimaryColumn({ name: 'moment_id', type: 'uuid' })
  momentId!: string;

  @PrimaryColumn({ name: 'artwork_id', type: 'uuid' })
  artworkId!: string;

  @Column({ name: 'display_order', type: 'smallint', default: 0 })
  displayOrder!: number;
}
