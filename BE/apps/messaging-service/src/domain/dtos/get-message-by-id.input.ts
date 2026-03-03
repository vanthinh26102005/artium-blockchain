import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class GetMessageByIdInput {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the message',
  })
  @IsString()
  @IsUUID()
  messageId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'The user ID to ensure access to the message',
  })
  @IsString()
  @IsUUID()
  userId: string;
}
