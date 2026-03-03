import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommentableType } from './create-comment.input';

export class CommentObject {
  @ApiProperty({
    description: 'Unique identifier of the comment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID of the commenter',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  userId: string;

  @ApiProperty({
    enum: CommentableType,
    description: 'Type of entity being commented on',
    example: CommentableType.MOMENT,
  })
  commentableType: CommentableType;

  @ApiProperty({
    description: 'ID of the entity being commented on',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  commentableId: string;

  @ApiPropertyOptional({
    description: 'Parent comment ID for replies',
  })
  parentCommentId?: string | null;

  @ApiProperty({
    description: 'Comment content',
    example: 'This is an amazing piece of art!',
  })
  content: string;

  @ApiPropertyOptional({
    description: 'URL to attached media',
  })
  mediaUrl?: string | null;

  @ApiPropertyOptional({
    description: 'User IDs mentioned in the comment',
    type: [String],
  })
  mentionedUserIds?: string[] | null;

  @ApiProperty({
    description: 'Number of likes on this comment',
    example: 5,
  })
  likeCount: number;

  @ApiProperty({
    description: 'Number of replies to this comment',
    example: 2,
  })
  replyCount: number;

  @ApiProperty({
    description: 'Whether the comment has been edited',
    example: false,
  })
  isEdited: boolean;

  @ApiPropertyOptional({
    description: 'When the comment was last edited',
  })
  editedAt?: Date | null;

  @ApiProperty({
    description: 'Whether the comment has been deleted',
    example: false,
  })
  isDeleted: boolean;

  @ApiPropertyOptional({
    description: 'When the comment was deleted',
  })
  deletedAt?: Date | null;

  @ApiProperty({
    description: 'Whether the comment has been flagged',
    example: false,
  })
  isFlagged: boolean;

  @ApiPropertyOptional({
    description: 'User ID of the content owner',
  })
  contentOwnerId?: string | null;

  @ApiProperty({
    description: 'When the comment was created',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'When the comment was last updated',
  })
  updatedAt?: Date | null;
}
