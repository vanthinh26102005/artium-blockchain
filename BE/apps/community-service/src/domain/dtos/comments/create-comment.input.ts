import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsArray,
  IsEnum,
  MaxLength,
  IsUUID,
} from 'class-validator';

export enum CommentableType {
  MOMENT = 'moment',
  MOODBOARD = 'moodboard',
  TESTIMONIAL = 'testimonial',
}

export class CreateCommentInput {
  @ApiProperty({
    description: 'User ID of the commenter',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    enum: CommentableType,
    description: 'Type of entity being commented on',
    example: CommentableType.MOMENT,
  })
  @IsEnum(CommentableType)
  @IsNotEmpty()
  commentableType: CommentableType;

  @ApiProperty({
    description: 'ID of the entity being commented on',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsString()
  @IsNotEmpty()
  commentableId: string;

  @ApiProperty({
    description: 'Comment content',
    maxLength: 2000,
    example: 'This is an amazing piece of art!',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string | null;

  @ApiPropertyOptional({
    description: 'Parent comment ID for replies',
  })
  @IsOptional()
  @IsUUID()
  parentCommentId?: string | null;

  @ApiPropertyOptional({
    description: 'URL to attached media',
  })
  @IsOptional()
  @IsUrl()
  mediaUrl?: string | null;

  @ApiPropertyOptional({
    description: 'User IDs mentioned in the comment',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentionedUserIds?: string[] | null;

  @ApiPropertyOptional({
    description: 'User ID of the content owner (for notifications)',
  })
  @IsOptional()
  @IsString()
  contentOwnerId?: string | null;
}
