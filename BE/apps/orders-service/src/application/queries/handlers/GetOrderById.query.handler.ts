import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import { GetOrderByIdQuery } from '../GetOrderById.query';
import { Order } from '../../../domain/entities';
import { IOrderRepository } from '../../../domain/interfaces';

@QueryHandler(GetOrderByIdQuery)
export class GetOrderByIdHandler implements IQueryHandler<GetOrderByIdQuery> {
  private readonly logger = new Logger(GetOrderByIdHandler.name);

  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(query: GetOrderByIdQuery): Promise<Order> {
    try {
      const { orderId } = query;
      this.logger.log(`Getting order: ${orderId}`);

      const order = await this.orderRepo.findWithItems(orderId);
      if (!order) {
        throw RpcExceptionHelper.notFound(`Order ${orderId} not found`);
      }

      return order;
    } catch (error) {
      this.logger.error(`Failed to get order`, error.stack);
      if (error instanceof RpcException) {
        throw error;
      }
      if (error instanceof HttpException) {
        throw RpcExceptionHelper.from(error.getStatus(), error.message);
      }
      throw RpcExceptionHelper.internalError(error.message);
    }
  }
}
