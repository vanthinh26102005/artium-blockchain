import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import { GetOrderItemsQuery } from '../GetOrderItems.query';
import { OrderItem } from '../../../domain/entities';
import { IOrderRepository, IOrderItemRepository } from '../../../domain/interfaces';

@QueryHandler(GetOrderItemsQuery)
export class GetOrderItemsHandler implements IQueryHandler<GetOrderItemsQuery> {
  private readonly logger = new Logger(GetOrderItemsHandler.name);

  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
    @Inject(IOrderItemRepository)
    private readonly orderItemRepo: IOrderItemRepository,
  ) {}

  async execute(query: GetOrderItemsQuery): Promise<OrderItem[]> {
    try {
      const { orderId } = query;
      this.logger.log(`Getting items for order: ${orderId}`);

      const order = await this.orderRepo.findById(orderId);
      if (!order) {
        throw RpcExceptionHelper.notFound(`Order ${orderId} not found`);
      }

      return this.orderItemRepo.findByOrderId(orderId);
    } catch (error) {
      this.logger.error(`Failed to get order items`, error.stack);
      if (error instanceof RpcException) throw error;
      if (error instanceof HttpException) {
        throw RpcExceptionHelper.from(error.getStatus(), error.message);
      }
      throw RpcExceptionHelper.internalError(error.message);
    }
  }
}
