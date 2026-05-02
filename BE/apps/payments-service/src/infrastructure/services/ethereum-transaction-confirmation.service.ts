import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { PaymentTransaction } from '../../domain/entities';

const DEFAULT_CONFIRMATION_RPC_URLS = [
  'https://rpc.sepolia.org',
  'https://ethereum-sepolia-rpc.publicnode.com',
];

export type EthereumConfirmationResult =
  | { kind: 'confirmed'; blockNumber: string }
  | { kind: 'retryable'; reason: string; failureCode: string }
  | { kind: 'invalid'; reason: string; failureCode: string };

@Injectable()
export class EthereumTransactionConfirmationService {
  private readonly requiredChainId: bigint;
  private readonly requiredChainIdNumber: number;
  private readonly requiredConfirmations: number;
  private readonly platformWalletAddress: string;
  private readonly confirmationRpcUrls: string[];

  constructor(private readonly configService: ConfigService) {
    const chainId =
      this.configService.get<string>('BLOCKCHAIN_CONFIRMATION_CHAIN_ID') ??
      '11155111';
    const minConfirmations = Number(
      this.configService.get<string>('WALLET_CONFIRMATION_MIN_CONFIRMATIONS') ??
        '1',
    );
    const privateKey = this.configService.get<string>('PLATFORM_PRIVATE_KEY');
    const configuredWallet = this.configService.get<string>(
      'PLATFORM_ETH_WALLET',
    );

    this.requiredChainId = BigInt(chainId);
    this.requiredChainIdNumber = Number(this.requiredChainId);
    this.requiredConfirmations =
      Number.isFinite(minConfirmations) && minConfirmations > 0
        ? minConfirmations
        : 1;
    this.platformWalletAddress = (
      configuredWallet ??
      (privateKey ? new ethers.Wallet(privateKey).address : '')
    ).toLowerCase();
    this.confirmationRpcUrls = this.resolveConfirmationRpcUrls();
  }

  async confirmTransaction(
    transaction: PaymentTransaction,
  ): Promise<EthereumConfirmationResult> {
    if (!transaction.txHash) {
      return {
        kind: 'invalid',
        reason: 'Ethereum transaction is missing a txHash.',
        failureCode: 'missing_tx_hash',
      };
    }

    if (!transaction.walletAddress) {
      return {
        kind: 'invalid',
        reason: 'Ethereum transaction is missing a wallet address.',
        failureCode: 'missing_wallet_address',
      };
    }

    if (!this.platformWalletAddress) {
      return {
        kind: 'invalid',
        reason: 'Platform wallet address is not configured for confirmation.',
        failureCode: 'platform_wallet_not_configured',
      };
    }

    const expectedWeiHex = transaction.metadata?.weiHex;
    if (typeof expectedWeiHex !== 'string' || expectedWeiHex.length === 0) {
      return {
        kind: 'invalid',
        reason: 'Recorded Ethereum transaction is missing quoted wei metadata.',
        failureCode: 'missing_quote_wei',
      };
    }

    try {
      const { chainTransaction, receipt, latestBlockNumber } =
        await this.loadTransactionState(transaction.txHash);

      if (!chainTransaction || !receipt) {
        return {
          kind: 'retryable',
          reason: 'Sepolia transaction has not been mined yet.',
          failureCode: 'receipt_not_found',
        };
      }

      if (chainTransaction.chainId !== this.requiredChainId) {
        return {
          kind: 'invalid',
          reason: 'Wallet transaction was submitted on the wrong chain.',
          failureCode: 'wrong_transaction_chain',
        };
      }

      const toAddress = chainTransaction.to?.toLowerCase() ?? '';
      if (toAddress !== this.platformWalletAddress) {
        return {
          kind: 'invalid',
          reason:
            'Wallet transaction destination does not match the platform wallet.',
          failureCode: 'wrong_destination',
        };
      }

      const fromAddress = chainTransaction.from.toLowerCase();
      if (fromAddress !== transaction.walletAddress.toLowerCase()) {
        return {
          kind: 'invalid',
          reason:
            'Wallet transaction sender does not match the recorded wallet.',
          failureCode: 'wrong_sender',
        };
      }

      if (chainTransaction.value !== BigInt(expectedWeiHex)) {
        return {
          kind: 'invalid',
          reason:
            'Wallet transaction amount does not match the quoted wei amount.',
          failureCode: 'wrong_amount',
        };
      }

      if (receipt.status !== 1) {
        return {
          kind: 'invalid',
          reason: 'Wallet transaction was mined but reverted on-chain.',
          failureCode: 'receipt_failed',
        };
      }

      const confirmations = latestBlockNumber - receipt.blockNumber + 1;
      if (confirmations < this.requiredConfirmations) {
        return {
          kind: 'retryable',
          reason: `Wallet transaction has ${confirmations} confirmation(s); waiting for ${this.requiredConfirmations}.`,
          failureCode: 'insufficient_confirmations',
        };
      }

      return {
        kind: 'confirmed',
        blockNumber: receipt.blockNumber.toString(),
      };
    } catch (error) {
      return {
        kind: 'retryable',
        reason:
          error instanceof Error
            ? error.message
            : 'Failed to reach the Sepolia confirmation provider.',
        failureCode: 'provider_error',
      };
    }
  }

  private resolveConfirmationRpcUrls(): string[] {
    const configured = [
      this.configService.get<string>('ETHEREUM_CONFIRMATION_RPC_URLS'),
      this.configService.get<string>('ETHEREUM_CONFIRMATION_RPC_URL'),
      this.configService.get<string>('BLOCKCHAIN_RPC_URL'),
    ]
      .filter((value): value is string => typeof value === 'string')
      .flatMap((value) => value.split(','))
      .map((value) => value.trim())
      .filter(Boolean);

    return [...new Set([...configured, ...DEFAULT_CONFIRMATION_RPC_URLS])];
  }

  private createProvider(rpcUrl: string): ethers.JsonRpcProvider {
    return new ethers.JsonRpcProvider(rpcUrl, this.requiredChainIdNumber, {
      staticNetwork: ethers.Network.from(this.requiredChainIdNumber),
    });
  }

  private async loadTransactionState(txHash: string): Promise<{
    chainTransaction: ethers.TransactionResponse | null;
    receipt: ethers.TransactionReceipt | null;
    latestBlockNumber: number;
  }> {
    let lastError: unknown = null;

    for (const rpcUrl of this.confirmationRpcUrls) {
      const provider = this.createProvider(rpcUrl);

      try {
        const [chainTransaction, receipt, latestBlockNumber] =
          await Promise.all([
            provider.getTransaction(txHash),
            provider.getTransactionReceipt(txHash),
            provider.getBlockNumber(),
          ]);

        return {
          chainTransaction,
          receipt,
          latestBlockNumber,
        };
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error
      ? new Error(
          `Failed to reach every configured Sepolia confirmation RPC: ${lastError.message}`,
        )
      : new Error('Failed to reach every configured Sepolia confirmation RPC.');
  }
}
