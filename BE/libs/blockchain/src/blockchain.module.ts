import { DynamicModule, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { OutboxModule } from '@app/outbox';
import {
  BlockchainConfig,
  BLOCKCHAIN_CONFIG,
  BLOCKCHAIN_PROVIDER,
  ESCROW_CONTRACT,
  PLATFORM_SIGNER,
} from './interfaces/blockchain-config.interface';
import { EscrowContractService } from './services/escrow-contract.service';
import { BlockchainEventListenerService } from './services/blockchain-event-listener.service';
import * as ABI from './abi/ArtAuctionEscrow.json';

@Module({})
export class BlockchainModule {
  static forRoot(): DynamicModule {
    return {
      module: BlockchainModule,
      global: true,
      imports: [ConfigModule, OutboxModule],
      providers: [
        {
          provide: BLOCKCHAIN_CONFIG,
          inject: [ConfigService],
          useFactory: (configService: ConfigService): BlockchainConfig => ({
            rpcUrl: configService.get<string>('BLOCKCHAIN_RPC_URL')!,
            contractAddress: configService.get<string>('CONTRACT_ADDRESS')!,
            platformPrivateKey: configService.get<string>(
              'PLATFORM_PRIVATE_KEY',
            )!,
          }),
        },
        {
          provide: BLOCKCHAIN_PROVIDER,
          inject: [BLOCKCHAIN_CONFIG],
          useFactory: (config: BlockchainConfig) => {
            const logger = new Logger('BlockchainProvider');
            logger.log(`Connecting to RPC: ${config.rpcUrl}`);
            return new ethers.JsonRpcProvider(config.rpcUrl);
          },
        },
        {
          provide: PLATFORM_SIGNER,
          inject: [BLOCKCHAIN_PROVIDER, BLOCKCHAIN_CONFIG],
          useFactory: (
            provider: ethers.JsonRpcProvider,
            config: BlockchainConfig,
          ) => {
            return new ethers.Wallet(config.platformPrivateKey, provider);
          },
        },
        {
          provide: ESCROW_CONTRACT,
          inject: [BLOCKCHAIN_PROVIDER, BLOCKCHAIN_CONFIG],
          useFactory: (
            provider: ethers.JsonRpcProvider,
            config: BlockchainConfig,
          ) => {
            const logger = new Logger('EscrowContract');
            logger.log(
              `Binding contract at address: ${config.contractAddress}`,
            );
            return new ethers.Contract(
              config.contractAddress,
              ABI,
              provider,
            );
          },
        },
        EscrowContractService,
        BlockchainEventListenerService,
      ],
      exports: [EscrowContractService, BlockchainEventListenerService],
    };
  }
}
