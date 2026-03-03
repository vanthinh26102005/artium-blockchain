import { AbstractEntity, TagStatus } from '@app/common';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ArtworkTag } from './artwork-tag.entity';

@Entity({ name: 'tags' })
@Index(['name'], { unique: true })
@Index(['status'])
@Index(['sellerId'])
export class Tag extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'name', type: 'varchar' })
  name!: string;

  @Column({
    type: 'enum',
    enum: TagStatus,
    default: TagStatus.CUSTOM,
  })
  status!: TagStatus;

  @Column({ name: 'seller_id', type: 'uuid', nullable: true })
  sellerId: string | null;

  @OneToMany(() => ArtworkTag, (artworkTag) => artworkTag.tag)
  artworkTags?: ArtworkTag[];
}
