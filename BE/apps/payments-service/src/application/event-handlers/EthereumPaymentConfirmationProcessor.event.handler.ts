import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import { ConfirmEthereumPaymentCommand } from '../commands/payments/ConfirmEthereumPayment.command';

@Injectable()
export class EthereumPaymentConfirmationProcessorEventHandler {
  private readonly logger = new Logger(
    EthereumPaymentConfirmationProcessorEventHandler.name,
  );

  constructor(private readonly commandBus: CommandBus) {}

  @RabbitSubscribe({
    exchange: ExchangeName.PAYMENT_EVENTS,
    routingKey: RoutingKey.PAYMENT_ETHEREUM_CONFIRMATION_REQUESTED,
    queue: 'payments-service.ethereum.confirmation-requested',
    queueOptions: { durable: true },
  })
  async handleConfirmationRequested(message: {
    transactionId?: string;
    txHash?: string;
  }) {
    if (!message.transactionId) {
      this.logger.warn('Ethereum confirmation message missing transactionId');
      return;
    }

    this.logger.log(
      `Processing Ethereum confirmation request for ${message.transactionId} (${message.txHash ?? 'no-tx-hash'})`,
    );

    await this.commandBus.execute(
      new ConfirmEthereumPaymentCommand(message.transactionId),
    );
  }
}
