import {
  DynamicDatabaseModule,
  ITransactionService,
  TransactionService,
} from '@app/common';
import { OutboxEntity, OutboxModule } from '@app/outbox';
import { AppRabbitMQModule } from '@app/rabbitmq';
import { BlockchainModule } from '@app/blockchain';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  Order,
  OrderItem,
  ShoppingCart,
  CartItem,
  AuctionStartAttempt,
} from './domain/entities';

import {
  IAuctionStartAttemptRepository,
  IOrderRepository,
  IOrderItemRepository,
} from './domain/interfaces';

import {
  AuctionStartAttemptRepository,
  OrderRepository,
  OrderItemRepository,
} from './infrastructure/repositories';

import {
  AttachSellerAuctionStartTxHandler,
  CreateOrderHandler,
  UpdateOrderStatusHandler,
  CancelOrderHandler,
  MarkShippedHandler,
  ConfirmDeliveryHandler,
  OpenDisputeHandler,
  ResolveDisputeHandler,
  GetAuctionByIdHandler,
  GetArtworkOrderLocksHandler,
  GetAuctionsHandler,
  GetOrdersHandler,
  GetOrderByIdHandler,
  GetOrderByOnChainIdHandler,
  GetOrderItemsHandler,
  GetSellerAuctionStartStatusHandler,
  StartSellerAuctionHandler,
  SellerAuctionLifecycleOutboxService,
} from './application';

import {
  BlockchainEventHandler,
  PaymentEventHandler,
} from './application/event-handlers';

import { OrdersMicroserviceController } from './presentation/microservice';

export const CommandHandlers = [
  CreateOrderHandler,
  StartSellerAuctionHandler,
  AttachSellerAuctionStartTxHandler,
  UpdateOrderStatusHandler,
  CancelOrderHandler,
  MarkShippedHandler,
  ConfirmDeliveryHandler,
  OpenDisputeHandler,
  ResolveDisputeHandler,
];

export const QueryHandlers = [
  GetAuctionsHandler,
  GetAuctionByIdHandler,
  GetArtworkOrderLocksHandler,
  GetOrdersHandler,
  GetOrderByIdHandler,
  GetOrderByOnChainIdHandler,
  GetOrderItemsHandler,
  GetSellerAuctionStartStatusHandler,
];

export const Repositories = [
  { provide: IOrderRepository, useClass: OrderRepository },
  { provide: IOrderItemRepository, useClass: OrderItemRepository },
  {
    provide: IAuctionStartAttemptRepository,
    useClass: AuctionStartAttemptRepository,
  },
];

export const Services = [
  { provide: ITransactionService, useClass: TransactionService },
  SellerAuctionLifecycleOutboxService,
];

export const EventHandlers = [BlockchainEventHandler, PaymentEventHandler];

export const Controllers = [OrdersMicroserviceController];

const ArtworkServiceClient = {
  name: 'ARTWORK_SERVICE',
  transport: Transport.TCP as const,
  options: {
    host: process.env.ARTWORK_SERVICE_HOST || 'localhost',
    port: parseInt(process.env.ARTWORK_SERVICE_PORT || '3102', 10),
  },
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/orders-service/.env.local',
    }),

    DynamicDatabaseModule.forRoot('orders'),
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      ShoppingCart,
      CartItem,
      AuctionStartAttempt,
      OutboxEntity,
    ]),

    OutboxModule,
    AppRabbitMQModule,
    CqrsModule,
    ClientsModule.register([ArtworkServiceClient]),
    BlockchainModule.forRoot(),
  ],
  controllers: [...Controllers],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
    ...Services,
    ...EventHandlers,
  ],
  exports: [ConfigModule],
})
export class OrdersServiceModule {}
