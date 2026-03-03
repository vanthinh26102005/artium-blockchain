import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ReorderFoldersInput {
  @ApiProperty({
    description: 'The seller ID who owns the folders',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  sellerId!: string;

  @ApiProperty({
    description: 'Array of folder IDs in desired order',
    example: ['folder-3', 'folder-1', 'folder-2'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  folderIds!: string[];
}
