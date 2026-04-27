import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OutboxService } from '@app/outbox';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import { IPaymentTransactionRepository } from '../../domain/interfaces';
import { EthereumPaymentConfirmationRequestedEvent } from '../../domain/events';

@Injectable()
export class RetryStuckEthereumConfirmationsWorker {
  private readonly logger = new Logger(RetryStuckEthereumConfirmationsWorker.name);
  private readonly leaseMs = 60_000;
  private readonly batchSize = 20;

  constructor(
    @Inject(IPaymentTransactionRepository)
    private readonly transactionRepo: IPaymentTransactionRepository,
    private readonly outboxService: OutboxService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async rescheduleReadyTransactions() {
    const staleAfter = new Date(Date.now() - this.leaseMs);
    const transactions = await this.transactionRepo.findEthereumTransactionsReadyForConfirmation(
      this.batchSize,
      staleAfter,
    );

    if (transactions.length === 0) {
      return;
    }

    this.logger.log(
      `Re-enqueueing ${transactions.length} Ethereum transaction(s) for confirmation`,
    );

    for (const transaction of transactions) {
      const event = new EthereumPaymentConfirmationRequestedEvent(
        transaction.id,
        transaction.txHash ?? '',
      );

      await this.outboxService.createOutboxMessage({
        aggregateType: 'PaymentTransaction',
        aggregateId: transaction.id,
        eventType: EthereumPaymentConfirmationRequestedEvent.getEventType(),
        payload: event.toPayload(),
        exchange: ExchangeName.PAYMENT_EVENTS,
        routingKey: RoutingKey.PAYMENT_ETHEREUM_CONFIRMATION_REQUESTED,
      });
    }
  }
}
