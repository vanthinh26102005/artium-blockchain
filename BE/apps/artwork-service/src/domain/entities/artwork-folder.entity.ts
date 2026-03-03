import { AbstractEntity } from '@app/common';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Artwork } from './artworks.entity';

@Entity({ name: 'artwork_folders' })
@Index(['sellerId'])
@Index(['parentId'])
@Index(['sellerId', 'name'])
@Index(['sellerId', 'position'])
export class ArtworkFolder extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'int', default: 0 })
  position!: number;

  @Column({ name: 'is_hidden', type: 'boolean', default: false })
  isHidden!: boolean;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string | null;

  @ManyToOne(() => ArtworkFolder, (folder) => folder.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: ArtworkFolder | null;

  @OneToMany(() => ArtworkFolder, (folder) => folder.parent)
  children: ArtworkFolder[] | null;

  @OneToMany(() => Artwork, (artwork) => artwork.folder)
  artworks: Artwork[] | null;
}
