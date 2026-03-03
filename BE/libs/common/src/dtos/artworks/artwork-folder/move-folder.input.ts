import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class MoveFolderInput {
  @ApiProperty({
    description: 'The ID of the folder to move',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  folderId!: string;

  @ApiPropertyOptional({
    description: 'The new parent folder ID (null to move to root)',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsString()
  newParentId?: string;
}
