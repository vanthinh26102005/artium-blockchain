import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class DeleteMessageInput {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the message to delete',
  })
  @IsString()
  @IsUUID()
  messageId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'The user ID to verify ownership of the message',
  })
  @IsString()
  @IsUUID()
  userId: string;
}
