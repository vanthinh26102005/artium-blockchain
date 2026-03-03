import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({
    description: 'Array of participant user IDs',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '987fcdeb-51a2-43d1-b789-012345678901',
    ],
    isArray: true,
    type: [String],
  })
  @IsArray()
  @IsNotEmpty({ message: 'Participants are required' })
  @MinLength(2, { message: 'At least 2 participants are required' })
  participantIds: string[];

  @ApiProperty({
    description: 'Optional conversation title',
    example: 'Artwork Discussion',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;
}
