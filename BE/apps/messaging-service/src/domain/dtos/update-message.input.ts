import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsNotEmpty } from 'class-validator';

export class UpdateMessageInput {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the message to update',
  })
  @IsString()
  @IsUUID()
  messageId: string;

  @ApiProperty({
    example: 'Updated message content',
    description: 'The new content of the message',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
