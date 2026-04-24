import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateOrderDto,
  UpdateOrderDto,
  GetOrdersDto,
  GetAuctionsDto,
  OrderStatus,
  RpcExceptionHelper,
} from '@app/common';
import {
  CreateOrderCommand,
  UpdateOrderStatusCommand,
  CancelOrderCommand,
  MarkShippedCommand,
  ConfirmDeliveryCommand,
  OpenDisputeCommand,
  ResolveDisputeCommand,
  GetOrdersQuery,
  GetAuctionsQuery,
  GetAuctionByIdQuery,
  GetArtworkOrderLocksQuery,
  GetOrderByIdQuery,
  GetOrderByOnChainIdQuery,
  GetOrderItemsQuery,
} from '../../application';

@Controller()
export class OrdersMicroserviceController {
  private readonly logger = new Logger(OrdersMicroserviceController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern({ cmd: 'create_order' })
  async createOrder(@Payload() data: CreateOrderDto) {
    this.logger.debug(`Creating order for buyer: ${data.buyerId}`);
    return this.commandBus.execute(new CreateOrderCommand(data));
  }

  @MessagePattern({ cmd: 'get_orders' })
  async getOrders(@Payload() data: GetOrdersDto) {
    this.logger.debug('Getting orders');
    return this.queryBus.execute(new GetOrdersQuery(data));
  }

  @MessagePattern({ cmd: 'get_auctions' })
  async getAuctions(@Payload() data: GetAuctionsDto) {
    this.logger.debug('Getting auctions');
    return this.queryBus.execute(new GetAuctionsQuery(data));
  }

  @MessagePattern({ cmd: 'get_auction_by_id' })
  async getAuctionById(@Payload() data: { auctionId: string }) {
    this.logger.debug(`Getting auction: ${data.auctionId}`);
    return this.queryBus.execute(new GetAuctionByIdQuery(data.auctionId));
  }

  @MessagePattern({ cmd: 'get_artwork_order_locks' })
  async getArtworkOrderLocks(
    @Payload() data: { sellerId: string; artworkIds: string[] },
  ) {
    this.logger.debug(`Getting artwork order locks for seller: ${data.sellerId}`);
    return this.queryBus.execute(
      new GetArtworkOrderLocksQuery(data.sellerId, data.artworkIds),
    );
  }

  @MessagePattern({ cmd: 'get_order_by_id' })
  async getOrderById(@Payload() data: { id: string }) {
    this.logger.debug(`Getting order: ${data.id}`);
    return this.queryBus.execute(new GetOrderByIdQuery(data.id));
  }

  @MessagePattern({ cmd: 'get_order_by_onchain_id' })
  async getOrderByOnChainId(@Payload() data: { onChainOrderId: string }) {
    this.logger.debug(`Getting order by on-chain id: ${data.onChainOrderId}`);
    return this.queryBus.execute(new GetOrderByOnChainIdQuery(data.onChainOrderId));
  }

  @MessagePattern({ cmd: 'update_order' })
  async updateOrder(
    @Payload() data: { id: string; status?: string; trackingNumber?: string; notes?: string },
  ) {
    this.logger.debug(`Updating order: ${data.id}`);

    if (!data.status) {
      throw RpcExceptionHelper.badRequest('Status is required for order update');
    }

    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(data.status as OrderStatus)) {
      throw RpcExceptionHelper.badRequest(
        `Invalid status: ${data.status}. Valid values: ${validStatuses.join(', ')}`,
      );
    }

    return this.commandBus.execute(
      new UpdateOrderStatusCommand(data.id, data.status as OrderStatus, {
        trackingNumber: data.trackingNumber,
        notes: data.notes,
      }),
    );
  }

  @MessagePattern({ cmd: 'cancel_order' })
  async cancelOrder(@Payload() data: { id: string; userId: string; reason?: string }) {
    this.logger.debug(`Cancelling order: ${data.id} by user: ${data.userId}`);
    return this.commandBus.execute(new CancelOrderCommand(data.id, data.userId, data.reason));
  }

  @MessagePattern({ cmd: 'get_order_items' })
  async getOrderItems(@Payload() data: { orderId: string }) {
    this.logger.debug(`Getting items for order: ${data.orderId}`);
    return this.queryBus.execute(new GetOrderItemsQuery(data.orderId));
  }

  @MessagePattern({ cmd: 'mark_shipped' })
  async markShipped(@Payload() data: { id: string; userId: string; carrier: string; trackingNumber: string; shippingMethod?: string }) {
    this.logger.debug(`Marking order as shipped: ${data.id} by user: ${data.userId}`);
    const { id, userId, ...dto } = data;
    return this.commandBus.execute(new MarkShippedCommand(id, userId, dto));
  }

  @MessagePattern({ cmd: 'confirm_delivery' })
  async confirmDelivery(@Payload() data: { id: string; userId: string; notes?: string }) {
    this.logger.debug(`Confirming delivery for order: ${data.id} by user: ${data.userId}`);
    const { id, userId, ...dto } = data;
    return this.commandBus.execute(new ConfirmDeliveryCommand(id, userId, dto));
  }

  @MessagePattern({ cmd: 'open_dispute' })
  async openDispute(@Payload() data: { id: string; userId: string; reason: string }) {
    this.logger.debug(`Opening dispute for order: ${data.id} by user: ${data.userId}`);
    const { id, userId, ...dto } = data;
    return this.commandBus.execute(new OpenDisputeCommand(id, userId, dto));
  }

  @MessagePattern({ cmd: 'resolve_dispute' })
  async resolveDispute(@Payload() data: { id: string; favorBuyer: boolean; resolutionNotes?: string }) {
    this.logger.debug(`Resolving dispute for order: ${data.id}`);
    const { id, ...dto } = data;
    return this.commandBus.execute(new ResolveDisputeCommand(id, dto));
  }
}
