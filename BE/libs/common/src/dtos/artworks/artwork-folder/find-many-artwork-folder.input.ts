import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class FindManyArtworkFolderInput {
  @ApiPropertyOptional({
    description: 'Filter folders by seller ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  sellerId?: string;

  @ApiPropertyOptional({
    description: 'Filter folders by parent folder ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Number of records to skip for pagination',
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  skip?: number;

  @ApiPropertyOptional({
    description: 'Number of records to return',
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  take?: number;
}
