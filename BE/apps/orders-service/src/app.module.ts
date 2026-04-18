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
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  Order,
  OrderItem,
  ShoppingCart,
  CartItem,
} from './domain/entities';

import {
  IOrderRepository,
  IOrderItemRepository,
} from './domain/interfaces';

import {
  OrderRepository,
  OrderItemRepository,
} from './infrastructure/repositories';

import {
  CreateOrderHandler,
  UpdateOrderStatusHandler,
  CancelOrderHandler,
  MarkShippedHandler,
  ConfirmDeliveryHandler,
  GetOrdersHandler,
  GetOrderByIdHandler,
  GetOrderByOnChainIdHandler,
  GetOrderItemsHandler,
} from './application';

import { BlockchainEventHandler } from './application/event-handlers';

import { OrdersMicroserviceController } from './presentation/microservice';

export const CommandHandlers = [
  CreateOrderHandler,
  UpdateOrderStatusHandler,
  CancelOrderHandler,
  MarkShippedHandler,
  ConfirmDeliveryHandler,
];

export const QueryHandlers = [
  GetOrdersHandler,
  GetOrderByIdHandler,
  GetOrderByOnChainIdHandler,
  GetOrderItemsHandler,
];

export const Repositories = [
  { provide: IOrderRepository, useClass: OrderRepository },
  { provide: IOrderItemRepository, useClass: OrderItemRepository },
];

export const Services = [
  { provide: ITransactionService, useClass: TransactionService },
];

export const EventHandlers = [
  BlockchainEventHandler,
];

export const Controllers = [
  OrdersMicroserviceController,
];

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
      OutboxEntity,
    ]),

    OutboxModule,
    AppRabbitMQModule,
    CqrsModule,
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
