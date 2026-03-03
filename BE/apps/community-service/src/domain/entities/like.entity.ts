import { AbstractEntity } from '@app/common';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum LikeableType {
  MOMENT = 'moment',
  MOODBOARD = 'moodboard',
  COMMENT = 'comment',
  TESTIMONIAL = 'testimonial',
}

@Entity({ name: 'likes' })
@Index(['userId', 'likeableType', 'likeableId'], { unique: true })
@Index(['likeableType', 'likeableId', 'createdAt'])
@Index(['userId', 'createdAt'])
export class Like extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'like_id' })
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({
    name: 'likeable_type',
    type: 'enum',
    enum: LikeableType,
    comment: 'Type of entity being liked (community-service entities only)',
  })
  likeableType!: LikeableType;

  @Column({ name: 'likeable_id', type: 'uuid' })
  likeableId!: string;

  @Column({ name: 'content_owner_id', type: 'uuid', nullable: true })
  contentOwnerId?: string | null;
}
