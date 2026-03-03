import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: 'Sender user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty({ message: 'Sender ID is required' })
  senderId: string;

  @ApiProperty({
    description: 'Conversation ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty({ message: 'Conversation ID is required' })
  conversationId: string;

  @ApiProperty({
    description: 'Message text content',
    example: 'Hello, I am interested in your artwork',
    required: false,
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.mediaUrl || o.content)
  content?: string;

  @ApiProperty({
    description: 'URL to media attachment (image, video, etc.)',
    example: 'https://example.com/media/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  mediaUrl?: string;
}
