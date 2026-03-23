import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginWalletDto {
  @ApiProperty({
    description: 'SIWE message signed by the wallet',
    example: 'artium.io wants you to sign in with your Ethereum account...',
  })
  @IsString()
  @IsNotEmpty({ message: 'SIWE message is required' })
  message: string;

  @ApiProperty({
    description: 'Signature produced by the wallet',
    example: '0xabc123...',
  })
  @IsString()
  @IsNotEmpty({ message: 'Signature is required' })
  signature: string;
}
