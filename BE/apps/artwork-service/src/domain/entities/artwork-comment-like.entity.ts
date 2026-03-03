import { AbstractEntity } from '@app/common';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ArtworkComment } from './artwork-comment.entity';

@Entity({ name: 'artwork_comment_likes' })
@Index(['userId', 'commentId'], { unique: true })
@Index(['commentId', 'createdAt'])
export class ArtworkCommentLike extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'like_id' })
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'comment_id', type: 'uuid' })
  commentId!: string;

  @ManyToOne(() => ArtworkComment, (comment) => comment.likes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comment_id' })
  comment!: ArtworkComment;
}
