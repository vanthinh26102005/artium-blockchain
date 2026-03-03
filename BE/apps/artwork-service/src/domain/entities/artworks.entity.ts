import {
  AbstractEntity,
  ArtworkImage,
  ArtworkStatus,
  Dimensions,
  Weight,
} from '@app/common';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ArtworkFolder } from './artwork-folder.entity';
import { ArtworkTag } from './artwork-tag.entity';
import { ArtworkComment } from './artwork-comment.entity';
import { ArtworkLike } from './artwork-like.entity';

@Entity({ name: 'artworks' })
@Index(['sellerId', 'status'])
@Index(['sellerId', 'isPublished', 'createdAt'])
@Index(['status', 'isPublished'])
@Index(['createdAt'])
export class Artwork extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId!: string;

  @Column({
    name: 'creator_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  creatorName: string | null;

  @Column({ type: 'varchar', length: 100 })
  title!: string;

  @Column({ type: 'varchar', nullable: true, length: 5000 })
  description: string | null;

  @Column({ name: 'creation_year', type: 'smallint', nullable: true })
  creationYear: number | null;

  @Column({ name: 'edition_run', type: 'varchar', length: 24, nullable: true })
  editionRun: string | null;

  @Column({ type: 'json', nullable: true })
  dimensions: Dimensions | null;

  @Column({ type: 'json', nullable: true })
  weight: Weight | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  materials: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  price: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency: string | null;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @Column({ type: 'enum', enum: ArtworkStatus, default: ArtworkStatus.DRAFT })
  status!: ArtworkStatus;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  images: ArtworkImage[] | null;

  @Column({ name: 'folder_id', type: 'uuid', nullable: true })
  folderId: string | null;

  @ManyToOne(() => ArtworkFolder, (folder) => folder.artworks, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'folder_id' })
  folder: ArtworkFolder | null;

  @OneToMany(() => ArtworkTag, (artworkTag) => artworkTag.artwork)
  tags?: ArtworkTag[];

  @OneToMany(() => ArtworkComment, (comment) => comment.artwork)
  comments?: ArtworkComment[];

  @OneToMany(() => ArtworkLike, (like) => like.artwork)
  likes?: ArtworkLike[];

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount!: number;

  @Column({ name: 'like_count', type: 'int', default: 0 })
  likeCount!: number;

  @Column({ name: 'comment_count', type: 'int', default: 0 })
  commentCount!: number;

  @Column({ name: 'moodboard_count', type: 'int', default: 0 })
  moodboardCount!: number;
}
