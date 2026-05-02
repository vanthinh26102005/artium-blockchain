import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  AuctionReadObject,
  GetAuctionsDto,
  OrderPaymentMethod,
  OrderStatus,
  RpcExceptionHelper,
} from '@app/common';
import { GetAuctionByIdQuery } from '../GetAuctionById.query';
import { GetAuctionsHandler } from './GetAuctions.query.handler';
import { IOrderRepository } from '../../../domain/interfaces';

@QueryHandler(GetAuctionByIdQuery)
export class GetAuctionByIdHandler implements IQueryHandler<GetAuctionByIdQuery> {
  private readonly logger = new Logger(GetAuctionByIdHandler.name);

  constructor(
    @Inject(IOrderRepository)
    private readonly orderRepo: IOrderRepository,
    private readonly getAuctionsHandler: GetAuctionsHandler,
  ) {}

  async execute(query: GetAuctionByIdQuery): Promise<AuctionReadObject> {
    try {
      const { auctionId } = query;
      this.logger.log(`Getting auction: ${auctionId}`);

      const order =
        (await this.orderRepo.findByOnChainOrderId(auctionId)) ??
        (await this.orderRepo.findById(auctionId));

      if (!order) {
        throw RpcExceptionHelper.notFound(`Auction ${auctionId} not found`);
      }
      if (
        order.paymentMethod !== OrderPaymentMethod.BLOCKCHAIN ||
        order.status !== OrderStatus.AUCTION_ACTIVE ||
        !order.onChainOrderId
      ) {
        throw RpcExceptionHelper.notFound(`Auction ${auctionId} not found`);
      }

      const auction = await this.getAuctionsHandler.toAuctionReadObject(
        order,
        new GetAuctionsDto(),
        0,
      );

      if (!auction) {
        throw RpcExceptionHelper.notFound(`Auction ${auctionId} not found`);
      }

      return auction;
    } catch (error) {
      this.logger.error('Failed to get auction by ID', error.stack);
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
