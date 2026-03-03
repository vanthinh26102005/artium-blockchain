import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { CreateInvoiceDto } from './create-invoice.dto';

export class SaveInvoiceDto extends CreateInvoiceDto {
  @ApiPropertyOptional({
    description: 'Invoice ID (provide for update, omit for create)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  id?: string;
}
