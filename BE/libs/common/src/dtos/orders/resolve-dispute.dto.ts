import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ResolveDisputeDto {
  @ApiProperty({
    description:
      'Whether the dispute is resolved in favor of the buyer (true) or seller (false)',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty({ message: 'favorBuyer decision is required' })
  favorBuyer: boolean;

  @ApiPropertyOptional({
    description: 'Arbiter resolution notes',
    example: 'Evidence confirms artwork was damaged during shipping',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, {
    message: 'Resolution notes must not exceed 2000 characters',
  })
  resolutionNotes?: string;
}
