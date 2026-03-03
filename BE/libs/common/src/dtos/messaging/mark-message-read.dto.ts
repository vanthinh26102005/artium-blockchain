import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MarkMessageReadDto {
  @ApiProperty({
    description: 'Message ID to mark as read',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty({ message: 'Message ID is required' })
  messageId: string;

  @ApiProperty({
    description: 'User ID marking the message as read',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;
}
