import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import { GetOrderByOnChainIdQuery } from '../GetOrderByOnChainId.query';
import { Order } from '../../../domain/entities';
import { IOrderRepository } from '../../../domain/interfaces';

@QueryHandler(GetOrderByOnChainIdQuery)
export class GetOrderByOnChainIdHandler
  implements IQueryHandler<GetOrderByOnChainIdQuery>
{
  private readonly logger = new Logger(GetOrderByOnChainIdHandler.name);

  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(query: GetOrderByOnChainIdQuery): Promise<Order> {
    try {
      const { onChainOrderId } = query;
      this.logger.log(`Getting order by on-chain ID: ${onChainOrderId}`);

      const order = await this.orderRepo.findByOnChainOrderId(onChainOrderId);
      if (!order) {
        throw RpcExceptionHelper.notFound(
          `Order with on-chain ID ${onChainOrderId} not found`,
        );
      }

      return order;
    } catch (error) {
      this.logger.error('Failed to get order by on-chain ID', error.stack);
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
