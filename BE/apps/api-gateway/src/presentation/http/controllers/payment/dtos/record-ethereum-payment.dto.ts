import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Matches,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecordEthereumPaymentDto {
  @ApiProperty({
    description: 'Ethereum transaction hash',
    example: '0x' + 'a'.repeat(64),
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{64}$/, {
    message: 'txHash must be a valid Ethereum transaction hash',
  })
  txHash!: string;

  @ApiProperty({
    description: 'Sender wallet address',
    example: '0x' + 'b'.repeat(40),
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'walletAddress must be a valid Ethereum address',
  })
  walletAddress!: string;

  @ApiProperty({ description: 'Amount paid in ETH', example: 0.5 })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({ description: 'Currency (ETH)', example: 'ETH' })
  @IsString()
  @IsNotEmpty()
  currency!: string;

  @ApiPropertyOptional({ description: 'Order ID' })
  @IsUUID()
  @IsOptional()
  orderId?: string;

  @ApiPropertyOptional({ description: 'Seller ID' })
  @IsUUID()
  @IsOptional()
  sellerId?: string;

  @ApiPropertyOptional({ description: 'Payment description' })
  @IsString()
  @IsOptional()
  description?: string;
}
