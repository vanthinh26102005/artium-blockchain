import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt } from 'class-validator';

export class FindTagsArgs {
  @ApiPropertyOptional({
    description: 'Number of records to skip for pagination',
    example: 0,
  })
  @IsOptional()
  @IsInt()
  skip?: number;

  @ApiPropertyOptional({
    description: 'Number of records to return',
    example: 20,
  })
  @IsOptional()
  @IsInt()
  take?: number;

  @ApiPropertyOptional({
    description: 'Filter tags by seller ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  sellerId?: string;

  @ApiPropertyOptional({
    description: 'Filter tags by status (ACTIVE, INACTIVE)',
    example: 'ACTIVE',
  })
  @IsOptional()
  status?: string;
}
