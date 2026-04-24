import {
  DynamicDatabaseModule,
  ITransactionService,
  TransactionService,
} from '@app/common';
import { OutboxEntity, OutboxModule } from '@app/outbox';
import { AppRabbitMQModule } from '@app/rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  Invoice,
  InvoiceItem,
  PaymentMethod,
  PaymentTransaction,
  Payout,
  StripeCustomer,
} from './domain/entities';

import {
  IInvoiceItemRepository,
  IInvoiceRepository,
  IPaymentMethodRepository,
  IPaymentTransactionRepository,
  IPayoutRepository,
  IStripeCustomerRepository,
} from './domain/interfaces';

import {
  InvoiceItemRepository,
  InvoiceRepository,
  PaymentMethodRepository,
  PaymentTransactionRepository,
  PayoutRepository,
  StripeCustomerRepository,
} from './infrastructure/repositories';

import {
  ConfirmEthereumPaymentHandler,
  CancelInvoiceHandler,
  CreateInvoiceHandler,
  CreateInvoicePaymentIntentHandler,
  CreatePaymentHandler,
  CreatePayoutHandler,
  GetInvoiceHandler,
  GetInvoiceByNumberHandler,
  GetInvoicesByCollectorHandler,
  GetEthereumQuoteHandler,
  GetInvoicesBySellerHandler,
  GetPaymentMethodsHandler,
  GetPaymentTransactionHandler,
  GetPayoutHandler,
  GetPayoutsBySellerHandler,
  GetTransactionsByUserHandler,
  MarkInvoiceAsPaidHandler,
  ProcessPayoutHandler,
  ProcessRefundHandler,
  SaveInvoiceHandler,
  SendInvoiceToBuyerHandler,
  SavePaymentMethodHandler,
  UpdateInvoiceHandler,
  RecordEthereumPaymentHandler,
} from './application';

import {
  AttachStripePaymentMethodHandler,
  ConfirmStripePaymentIntentHandler,
  CreateStripeCustomerHandler,
  CreateStripePaymentIntentHandler,
  CreateStripeRefundHandler,
  HandleStripeWebhookHandler,
} from './application/commands/stripe';

import { StripeService } from './infrastructure/services/stripe.service';
import { EthereumQuoteService } from './infrastructure/services/ethereum-quote.service';
import { EthereumTransactionConfirmationService } from './infrastructure/services/ethereum-transaction-confirmation.service';

import { HealthController } from './presentation';

import {
  StripeController,
  StripeWebhookController,
} from './presentation/http/controllers';

import { PaymentsMicroserviceController } from './presentation/microservice';
import {
  EthereumPaymentConfirmationProcessorEventHandler,
  RetryStuckEthereumConfirmationsWorker,
} from './application/event-handlers';

export const CommandHandlers = [
  CreateInvoiceHandler,
  CreateInvoicePaymentIntentHandler,
  UpdateInvoiceHandler,
  CancelInvoiceHandler,
  MarkInvoiceAsPaidHandler,
  SaveInvoiceHandler,
  SendInvoiceToBuyerHandler,

  CreatePaymentHandler,
  ProcessRefundHandler,
  SavePaymentMethodHandler,

  CreatePayoutHandler,
  ProcessPayoutHandler,

  CreateStripePaymentIntentHandler,
  ConfirmStripePaymentIntentHandler,
  CreateStripeCustomerHandler,
  CreateStripeRefundHandler,
  AttachStripePaymentMethodHandler,
  HandleStripeWebhookHandler,

  RecordEthereumPaymentHandler,
  ConfirmEthereumPaymentHandler,
];

export const QueryHandlers = [
  GetInvoiceHandler,
  GetInvoiceByNumberHandler,
  GetInvoicesBySellerHandler,
  GetInvoicesByCollectorHandler,

  GetEthereumQuoteHandler,
  GetPaymentTransactionHandler,
  GetPaymentMethodsHandler,
  GetTransactionsByUserHandler,

  GetPayoutHandler,
  GetPayoutsBySellerHandler,
];

export const Repositories = [
  { provide: IInvoiceRepository, useClass: InvoiceRepository },
  { provide: IInvoiceItemRepository, useClass: InvoiceItemRepository },
  { provide: IPaymentMethodRepository, useClass: PaymentMethodRepository },
  {
    provide: IPaymentTransactionRepository,
    useClass: PaymentTransactionRepository,
  },
  { provide: IPayoutRepository, useClass: PayoutRepository },
  { provide: IStripeCustomerRepository, useClass: StripeCustomerRepository },
];

export const Services = [
  { provide: ITransactionService, useClass: TransactionService },
  StripeService,
  EthereumQuoteService,
  EthereumTransactionConfirmationService,
  EthereumPaymentConfirmationProcessorEventHandler,
  RetryStuckEthereumConfirmationsWorker,
  {
    provide: 'STRIPE_API_KEY',
    useFactory: async (configService: ConfigService) =>
      configService.get('STRIPE_API_KEY'),
    inject: [ConfigService],
  },
];

export const Controllers = [
  HealthController,
  StripeController,
  StripeWebhookController,
  PaymentsMicroserviceController,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/payments-service/.env.local',
    }),

    DynamicDatabaseModule.forRoot('payments'),
    TypeOrmModule.forFeature([
      Invoice,
      InvoiceItem,
      PaymentMethod,
      PaymentTransaction,
      Payout,
      StripeCustomer,
      OutboxEntity,
    ]),

    OutboxModule,
    AppRabbitMQModule,
    CqrsModule,
  ],
  controllers: [...Controllers],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
    ...Services,
  ],
  exports: [ConfigModule],
})
export class PaymentsServiceModule {}
