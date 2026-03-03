import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LikeableType } from './create-like.input';

export class LikeObject {
  @ApiProperty({
    description: 'Unique identifier of the like',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID of the person who liked',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  userId: string;

  @ApiProperty({
    enum: LikeableType,
    description: 'Type of entity that was liked',
    example: LikeableType.MOMENT,
  })
  likeableType: LikeableType;

  @ApiProperty({
    description: 'ID of the entity that was liked',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  likeableId: string;

  @ApiPropertyOptional({
    description: 'User ID of the content owner',
  })
  contentOwnerId?: string | null;

  @ApiProperty({
    description: 'When the like was created',
  })
  createdAt: Date;
}
