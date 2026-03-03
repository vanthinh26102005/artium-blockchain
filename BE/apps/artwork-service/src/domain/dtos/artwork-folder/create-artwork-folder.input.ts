import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateArtworkFolderInput {
  @ApiProperty({
    description: 'The unique identifier of the seller',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  sellerId!: string;

  @ApiProperty({
    description: 'The name of the folder',
    example: 'My Paintings',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: 'The parent folder ID if this is a subfolder',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsString()
  parentId?: string;
}
