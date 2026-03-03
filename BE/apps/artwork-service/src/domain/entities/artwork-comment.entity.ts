import { AbstractEntity } from '@app/common';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Artwork } from './artworks.entity';
import { ArtworkCommentLike } from './artwork-comment-like.entity';

@Entity({ name: 'artwork_comments' })
@Index(['artworkId', 'createdAt'])
@Index(['artworkId', 'parentCommentId'])
@Index(['userId', 'createdAt'])
@Index(['sellerId'])
@Index(['isDeleted', 'createdAt'])
export class ArtworkComment extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'comment_id' })
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'artwork_id', type: 'uuid' })
  artworkId!: string;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId!: string;

  @Column({ name: 'parent_comment_id', type: 'uuid', nullable: true })
  parentCommentId: string | null;

  @Column({ type: 'text' })
  content!: string;

  @Column({ name: 'media_url', type: 'varchar', length: 1024, nullable: true })
  mediaUrl: string | null;

  @Column({ name: 'mentioned_user_ids', type: 'jsonb', nullable: true })
  mentionedUserIds: string[] | null;

  @Column({ name: 'like_count', type: 'int', default: 0 })
  likeCount!: number;

  @Column({ name: 'reply_count', type: 'int', default: 0 })
  replyCount!: number;

  @Column({ name: 'is_edited', type: 'boolean', default: false })
  isEdited!: boolean;

  @Column({ name: 'edited_at', type: 'timestamp', nullable: true })
  editedAt: Date | null;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted!: boolean;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @Column({ name: 'is_flagged', type: 'boolean', default: false })
  isFlagged!: boolean;

  @ManyToOne(() => Artwork, (artwork) => artwork.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'artwork_id' })
  artwork!: Artwork;

  @ManyToOne(() => ArtworkComment, (comment) => comment.replies, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_comment_id' })
  parent: ArtworkComment | null;

  @OneToMany(() => ArtworkComment, (comment) => comment.parent)
  replies?: ArtworkComment[];

  @OneToMany(() => ArtworkCommentLike, (like) => like.comment)
  likes?: ArtworkCommentLike[];
}
