import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class FollowUserInput {
  @ApiProperty({
    description: 'User ID of the follower (who is following)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  followingUserId: string;

  @ApiProperty({
    description: 'User ID being followed',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsString()
  @IsNotEmpty()
  followedUserId: string;

  @ApiPropertyOptional({
    description: 'Whether to receive notifications for posts',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  notifyOnPosts?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to receive notifications for events',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  notifyOnEvents?: boolean;

  @ApiPropertyOptional({
    description: 'Source of the follow (e.g., profile, search, suggestion)',
    maxLength: 50,
    example: 'profile',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  followSource?: string;
}
