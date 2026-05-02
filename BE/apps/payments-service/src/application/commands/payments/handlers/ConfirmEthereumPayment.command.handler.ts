import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { OutboxService } from '@app/outbox';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import { PaymentProvider, TransactionStatus } from '@app/common';
import { ConfirmEthereumPaymentCommand } from '../ConfirmEthereumPayment.command';
import { IPaymentTransactionRepository } from '../../../../domain/interfaces';
import { EthereumTransactionConfirmationService } from '../../../../infrastructure/services/ethereum-transaction-confirmation.service';
import {
  PaymentFailedEvent,
  PaymentSucceededEvent,
} from '../../../../domain/events';

@CommandHandler(ConfirmEthereumPaymentCommand)
export class ConfirmEthereumPaymentHandler implements ICommandHandler<
  ConfirmEthereumPaymentCommand,
  void
> {
  private readonly logger = new Logger(ConfirmEthereumPaymentHandler.name);
  private readonly attemptLeaseMs = 60_000;

  constructor(
    @Inject(IPaymentTransactionRepository)
    private readonly transactionRepo: IPaymentTransactionRepository,
    private readonly confirmationService: EthereumTransactionConfirmationService,
    private readonly outboxService: OutboxService,
  ) {}

  async execute(command: ConfirmEthereumPaymentCommand): Promise<void> {
    const transaction = await this.transactionRepo.findById(
      command.transactionId,
    );
    if (!transaction) {
      this.logger.warn(
        `Ethereum transaction not found: ${command.transactionId}`,
      );
      return;
    }

    if (transaction.provider !== PaymentProvider.ETHEREUM) {
      this.logger.warn(
        `Skipping non-Ethereum transaction confirmation: ${transaction.id}`,
      );
      return;
    }

    if (
      transaction.status === TransactionStatus.SUCCEEDED ||
      transaction.status === TransactionStatus.FAILED
    ) {
      this.logger.debug(
        `Skipping terminal Ethereum transaction ${transaction.id} (${transaction.status})`,
      );
      return;
    }

    const startedAt = new Date();
    const claimed = await this.transactionRepo.tryStartConfirmationAttempt(
      transaction.id,
      startedAt,
      new Date(startedAt.getTime() - this.attemptLeaseMs),
    );

    if (!claimed) {
      this.logger.debug(
        `Confirmation attempt already active for transaction ${transaction.id}`,
      );
      return;
    }

    const latestTransaction = await this.transactionRepo.findById(
      transaction.id,
    );
    if (!latestTransaction) {
      return;
    }

    const result =
      await this.confirmationService.confirmTransaction(latestTransaction);

    if (result.kind === 'confirmed') {
      const updated =
        await this.transactionRepo.markEthereumTransactionSucceeded(
          latestTransaction.id,
          result.blockNumber,
        );

      if (updated?.status !== TransactionStatus.SUCCEEDED) {
        return;
      }

      const event = new PaymentSucceededEvent({
        transactionId: updated.id,
        userId: updated.userId,
        amount: Number(updated.amount),
        currency: updated.currency,
        provider: PaymentProvider.ETHEREUM,
        orderId: updated.orderId ?? undefined,
        invoiceId: updated.invoiceId ?? undefined,
        txHash: updated.txHash ?? undefined,
      });

      await this.outboxService.createOutboxMessage({
        aggregateType: 'PaymentTransaction',
        aggregateId: updated.id,
        eventType: PaymentSucceededEvent.getEventType(),
        payload: event.toPayload(),
        exchange: ExchangeName.PAYMENT_EVENTS,
        routingKey: RoutingKey.PAYMENT_SUCCEEDED,
      });

      this.logger.log(
        `Ethereum transaction confirmed: ${updated.id} (${updated.txHash})`,
      );
      return;
    }

    if (result.kind === 'invalid') {
      const updated = await this.transactionRepo.markEthereumTransactionFailed(
        latestTransaction.id,
        result.reason,
        result.failureCode,
      );

      if (updated?.status !== TransactionStatus.FAILED) {
        return;
      }

      const event = new PaymentFailedEvent({
        transactionId: updated.id,
        userId: updated.userId,
        amount: Number(updated.amount),
        currency: updated.currency,
        failureReason: result.reason,
        provider: PaymentProvider.ETHEREUM,
        failureCode: result.failureCode,
        orderId: updated.orderId ?? undefined,
        txHash: updated.txHash ?? undefined,
      });

      await this.outboxService.createOutboxMessage({
        aggregateType: 'PaymentTransaction',
        aggregateId: updated.id,
        eventType: PaymentFailedEvent.getEventType(),
        payload: event.toPayload(),
        exchange: ExchangeName.PAYMENT_EVENTS,
        routingKey: RoutingKey.PAYMENT_FAILED,
      });

      this.logger.warn(
        `Ethereum transaction failed confirmation: ${updated.id} (${result.failureCode})`,
      );
      return;
    }

    const nextRetryAt = this.computeNextRetryAt(
      latestTransaction.confirmationAttempts ?? 1,
    );

    await this.transactionRepo.scheduleNextConfirmationAttempt(
      latestTransaction.id,
      nextRetryAt,
      result.reason,
    );

    this.logger.warn(
      `Ethereum confirmation deferred for ${latestTransaction.id} until ${nextRetryAt.toISOString()} (${result.failureCode})`,
    );
  }

  private computeNextRetryAt(attempts: number): Date {
    const boundedAttempts = Math.max(1, attempts);
    const backoffMs = Math.min(
      30_000 * 2 ** (boundedAttempts - 1),
      10 * 60_000,
    );
    return new Date(Date.now() + backoffMs);
  }
}
