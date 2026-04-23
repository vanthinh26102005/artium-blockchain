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
import { PaymentTransaction } from '../../../../domain/entities';

@CommandHandler(RecordEthereumPaymentCommand)
export class RecordEthereumPaymentHandler
  implements ICommandHandler<RecordEthereumPaymentCommand>
{
  private readonly logger = new Logger(RecordEthereumPaymentHandler.name);

  constructor(
    @Inject(IPaymentTransactionRepository)
    private readonly transactionRepo: IPaymentTransactionRepository,
    private readonly outboxService: OutboxService,
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

    let transaction: PaymentTransaction;
    try {
      transaction = await this.transactionRepo.create({
        type: TransactionType.PAYMENT,
        status: TransactionStatus.PROCESSING,
        provider: PaymentProvider.ETHEREUM,
        userId: data.userId,
        orderId: data.orderId ?? null,
        amount: data.amount,
        currency: data.currency.toUpperCase(),
        paymentMethodType: PaymentMethodType.CRYPTO_WALLET,
        walletAddress: data.walletAddress,
        txHash: data.txHash,
        description: data.description ?? null,
      } as Omit<PaymentTransaction, 'transactionId' | 'createdAt'>);
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
      data.amount,
      data.currency,
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

    this.logger.log(
      `EthereumPaymentRecordedEvent published for transaction: ${transaction.id}`,
    );
    return transaction;
  }
}
