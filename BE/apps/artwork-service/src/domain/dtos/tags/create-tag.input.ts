import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { TagStatus } from '@app/common';

export class CreateTagInput {
  @ApiProperty({ description: 'The name of the tag', example: 'Landscape' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: 'The unique identifier of the seller',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  sellerId?: string;

  @ApiPropertyOptional({
    description: 'The status of the tag',
    enum: TagStatus,
    example: 'ACTIVE',
  })
  @IsOptional()
  status?: TagStatus;
}
