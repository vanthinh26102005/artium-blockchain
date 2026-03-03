import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class GetConversationByIdInput {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the conversation',
  })
  @IsString()
  @IsUUID()
  conversationId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'The user ID to ensure access to the conversation',
  })
  @IsString()
  @IsUUID()
  userId: string;
}
