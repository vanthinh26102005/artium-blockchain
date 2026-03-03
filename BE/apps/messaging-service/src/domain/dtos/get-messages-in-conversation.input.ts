import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsNumber, IsOptional, Min } from 'class-validator';

export class GetMessagesInConversationInput {
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

  @ApiPropertyOptional({
    example: 20,
    description: 'Maximum number of messages to return',
    default: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Number of messages to skip',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}
