import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MarkShippedDto {
  @ApiProperty({
    description: 'Shipping carrier name',
    example: 'FedEx',
  })
  @IsString()
  @IsNotEmpty({ message: 'Carrier is required' })
  carrier: string;

  @ApiProperty({
    description: 'Tracking number or IPFS hash of shipping proof',
    example: 'TRACK-123456789',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tracking number is required' })
  trackingNumber: string;

  @ApiPropertyOptional({
    description: 'Shipping method description',
    example: 'Express International',
  })
  @IsOptional()
  @IsString()
  shippingMethod?: string;
}
