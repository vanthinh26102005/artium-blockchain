import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { TagStatus } from '@app/common';

export class UpdateTagInput {
  @ApiPropertyOptional({
    description: 'The new name of the tag',
    example: 'Updated Tag Name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'The new status of the tag',
    enum: TagStatus,
    example: 'INACTIVE',
  })
  @IsOptional()
  status?: TagStatus;
}
