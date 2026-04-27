import { Type } from 'class-transformer';
import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetEthereumQuoteDto {
  @ApiProperty({
    description: 'Checkout total in USD for the MetaMask Sepolia quote',
    example: 149.99,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  usdAmount!: number;
}
