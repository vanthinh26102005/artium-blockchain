import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ConfirmDeliveryDto {
  @ApiPropertyOptional({
    description: 'Optional notes from buyer about the delivery',
    example: 'Artwork received in perfect condition',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
