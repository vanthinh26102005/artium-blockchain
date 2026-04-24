import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import { GetOrdersQuery } from '../GetOrders.query';
import { Order } from '../../../domain/entities';
import { IOrderRepository } from '../../../domain/interfaces';

@QueryHandler(GetOrdersQuery)
export class GetOrdersHandler implements IQueryHandler<GetOrdersQuery> {
  private readonly logger = new Logger(GetOrdersHandler.name);

  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(query: GetOrdersQuery): Promise<{ data: Order[]; total: number }> {
    try {
      const { filters } = query;
      this.logger.log(
        `Getting orders with filters: ${JSON.stringify(filters)}`,
      );

      // sellerId requires a join through order_items
      if (filters.sellerId) {
        return this.orderRepo.findBySellerIdViaItems(
          filters.sellerId,
          {
            skip: filters.skip,
            take: filters.take ?? 20,
            status: filters.status,
            onChainOrderId: filters.onChainOrderId,
            escrowState: filters.escrowState,
            paymentMethod: filters.paymentMethod,
          },
        );
      }

      const where: Record<string, any> = {};
      if (filters.buyerId) where.collectorId = filters.buyerId;
      if (filters.status) where.status = filters.status;
      if (filters.onChainOrderId) where.onChainOrderId = filters.onChainOrderId;
      if (filters.escrowState !== undefined) where.escrowState = filters.escrowState;
      if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;

      const take = filters.take ?? 20;
      const [data, total] = await Promise.all([
        this.orderRepo.find({
          where,
          skip: filters.skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
        this.orderRepo.count(where),
      ]);

      return { data, total };
    } catch (error) {
      this.logger.error(`Failed to get orders`, error.stack);
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
