import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsPositive,
  Matches,
  IsOptional,
  IsIn,
} from 'class-validator';

export class RecordEthereumPaymentDTO {
  @IsUUID()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{64}$/, {
    message:
      'txHash must be a valid Ethereum transaction hash (0x + 64 hex chars)',
  })
  txHash!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message:
      'walletAddress must be a valid Ethereum address (0x + 40 hex chars)',
  })
  walletAddress!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['USD', 'usd'])
  currency!: string;

  @IsString()
  @IsNotEmpty()
  quoteToken!: string;

  @IsString()
  @IsNotEmpty()
  chainId!: string;

  @IsUUID()
  @IsOptional()
  orderId?: string;

  @IsUUID()
  @IsOptional()
  sellerId?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
