import { AbstractEntity } from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum CommentableType {
  MOMENT = 'moment',
  MOODBOARD = 'moodboard',
  TESTIMONIAL = 'testimonial',
}

@Entity({ name: 'comments' })
@Index(['commentableType', 'commentableId', 'createdAt'])
@Index(['userId', 'createdAt'])
@Index(['parentCommentId'])
export class Comment extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'comment_id' })
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({
    name: 'commentable_type',
    type: 'enum',
    enum: CommentableType,
  })
  commentableType!: CommentableType;

  @Column({ name: 'commentable_id', type: 'uuid' })
  commentableId!: string;

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

  @Column({ name: 'content_owner_id', type: 'uuid', nullable: true })
  contentOwnerId: string | null;
}
