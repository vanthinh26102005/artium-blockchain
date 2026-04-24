import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RecordEthereumPaymentCommand } from '../RecordEthereumPayment.command';
import { IPaymentTransactionRepository } from '../../../../domain/interfaces';
import { OutboxService } from '@app/outbox';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import {
  PaymentProvider,
  PaymentMethodType,
  TransactionStatus,
  TransactionType,
  RpcExceptionHelper,
} from '@app/common';
import { EthereumPaymentRecordedEvent } from '../../../../domain/events';
import { EthereumPaymentConfirmationRequestedEvent } from '../../../../domain/events';
import { PaymentTransaction } from '../../../../domain/entities';
import { EthereumQuoteService } from '../../../../infrastructure/services/ethereum-quote.service';

@CommandHandler(RecordEthereumPaymentCommand)
export class RecordEthereumPaymentHandler
  implements ICommandHandler<RecordEthereumPaymentCommand>
{
  private readonly logger = new Logger(RecordEthereumPaymentHandler.name);

  constructor(
    @Inject(IPaymentTransactionRepository)
    private readonly transactionRepo: IPaymentTransactionRepository,
    private readonly outboxService: OutboxService,
    private readonly ethereumQuoteService: EthereumQuoteService,
  ) {}

  async execute(
    command: RecordEthereumPaymentCommand,
  ): Promise<PaymentTransaction> {
    const { data } = command;

    this.logger.log(
      `Recording Ethereum payment for user: ${data.userId}, txHash: ${data.txHash}`,
    );

    const existing = await this.transactionRepo.findByTxHash(data.txHash);
    if (existing) {
      throw RpcExceptionHelper.conflict(
        `Transaction with txHash ${data.txHash} already recorded`,
      );
    }

    const quote = this.ethereumQuoteService.verifyQuoteToken(data.quoteToken);

    if (this.ethereumQuoteService.isExpired(quote)) {
      throw RpcExceptionHelper.badRequest(
        'Ethereum quote expired. Refresh the quote and retry the payment.',
      );
    }

    if (
      this.normalizeChainId(data.chainId) !== this.normalizeChainId(quote.chainId)
    ) {
      throw RpcExceptionHelper.badRequest(
        'Wallet checkout is only allowed on Sepolia testnet.',
      );
    }

    if (data.currency.toUpperCase() !== quote.fiatCurrency) {
      throw RpcExceptionHelper.badRequest(
        'Ethereum payment currency must match the quoted USD checkout total.',
      );
    }

    if (!this.usdAmountsMatch(data.amount, quote.usdAmount)) {
      throw RpcExceptionHelper.badRequest(
        'Ethereum payment amount does not match the active quote.',
      );
    }

    let transaction: PaymentTransaction;
    try {
      transaction = await this.transactionRepo.create({
        type: TransactionType.PAYMENT,
        status: TransactionStatus.PROCESSING,
        provider: PaymentProvider.ETHEREUM,
        userId: data.userId,
        orderId: data.orderId ?? null,
        amount: quote.usdAmount,
        currency: quote.fiatCurrency,
        paymentMethodType: PaymentMethodType.CRYPTO_WALLET,
        walletAddress: data.walletAddress,
        txHash: data.txHash,
        description: data.description ?? null,
        metadata: {
          quoteId: quote.quoteId,
          provider: quote.provider,
          fiatCurrency: quote.fiatCurrency,
          cryptoCurrency: quote.cryptoCurrency,
          ethAmount: quote.ethAmount,
          weiHex: quote.weiHex,
          usdPerEth: quote.usdPerEth,
          chainId: quote.chainId,
          chainName: quote.chainName,
          blockExplorerUrl: quote.blockExplorerUrl,
          quotedAt: quote.quotedAt,
          expiresAt: quote.expiresAt,
        },
        confirmationAttempts: 0,
        nextConfirmationAt: new Date(),
        confirmationStartedAt: null,
        lastConfirmationError: null,
      } as unknown as Omit<PaymentTransaction, 'transactionId' | 'createdAt'>);
    } catch (error) {
      this.logger.error(
        'Failed to create Ethereum payment transaction',
        error.stack,
      );
      throw RpcExceptionHelper.internalError('Failed to record payment');
    }

    const event = new EthereumPaymentRecordedEvent(
      transaction.id,
      data.userId,
      data.walletAddress,
      data.txHash,
      quote.usdAmount,
      quote.fiatCurrency,
      data.orderId,
    );

    await this.outboxService.createOutboxMessage({
      aggregateType: 'PaymentTransaction',
      aggregateId: transaction.id,
      eventType: EthereumPaymentRecordedEvent.getEventType(),
      payload: event.toPayload(),
      exchange: ExchangeName.PAYMENT_EVENTS,
      routingKey: RoutingKey.PAYMENT_ETHEREUM_RECORDED,
    });

    const confirmationRequestedEvent =
      new EthereumPaymentConfirmationRequestedEvent(transaction.id, data.txHash);

    await this.outboxService.createOutboxMessage({
      aggregateType: 'PaymentTransaction',
      aggregateId: transaction.id,
      eventType: EthereumPaymentConfirmationRequestedEvent.getEventType(),
      payload: confirmationRequestedEvent.toPayload(),
      exchange: ExchangeName.PAYMENT_EVENTS,
      routingKey: RoutingKey.PAYMENT_ETHEREUM_CONFIRMATION_REQUESTED,
    });

    this.logger.log(
      `EthereumPaymentRecordedEvent published for transaction: ${transaction.id}`,
    );
    return transaction;
  }

  private normalizeChainId(chainId: string): string {
    try {
      return BigInt(chainId).toString();
    } catch {
      if (chainId.startsWith('0x')) {
        return BigInt(chainId).toString();
      }

      throw RpcExceptionHelper.badRequest(
        'Wallet checkout is only allowed on Sepolia testnet.',
      );
    }
  }

  private usdAmountsMatch(left: number, right: number): boolean {
    return Math.round(left * 100) === Math.round(right * 100);
  }
}
