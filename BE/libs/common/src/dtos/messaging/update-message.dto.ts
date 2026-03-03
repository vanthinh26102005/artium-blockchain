import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateMessageDto {
  @ApiProperty({
    description: 'User ID making the update',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @ApiProperty({
    description: 'New message content',
    example: 'Updated message text',
  })
  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  content: string;
}
