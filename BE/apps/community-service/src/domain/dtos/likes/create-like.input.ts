import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';

export enum LikeableType {
  MOMENT = 'moment',
  MOODBOARD = 'moodboard',
  COMMENT = 'comment',
  TESTIMONIAL = 'testimonial',
}

export class CreateLikeInput {
  @ApiProperty({
    description: 'User ID of the person liking',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    enum: LikeableType,
    description: 'Type of entity being liked',
    example: LikeableType.MOMENT,
  })
  @IsEnum(LikeableType)
  @IsNotEmpty()
  likeableType: LikeableType;

  @ApiProperty({
    description: 'ID of the entity being liked',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsString()
  @IsNotEmpty()
  likeableId: string;

  @ApiPropertyOptional({
    description: 'User ID of the content owner (for notifications)',
  })
  @IsOptional()
  @IsString()
  contentOwnerId: string | null;
}
