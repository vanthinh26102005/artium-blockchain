import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateOrderDto,
  UpdateOrderDto,
  GetOrdersDto,
  OrderStatus,
  RpcExceptionHelper,
} from '@app/common';
import {
  CreateOrderCommand,
  UpdateOrderStatusCommand,
  CancelOrderCommand,
  MarkShippedCommand,
  ConfirmDeliveryCommand,
  GetOrdersQuery,
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
  async cancelOrder(@Payload() data: { id: string; reason?: string }) {
    this.logger.debug(`Cancelling order: ${data.id}`);
    return this.commandBus.execute(new CancelOrderCommand(data.id, data.reason));
  }

  @MessagePattern({ cmd: 'get_order_items' })
  async getOrderItems(@Payload() data: { orderId: string }) {
    this.logger.debug(`Getting items for order: ${data.orderId}`);
    return this.queryBus.execute(new GetOrderItemsQuery(data.orderId));
  }

  @MessagePattern({ cmd: 'mark_shipped' })
  async markShipped(@Payload() data: { id: string; carrier: string; trackingNumber: string; shippingMethod?: string }) {
    this.logger.debug(`Marking order as shipped: ${data.id}`);
    const { id, ...dto } = data;
    return this.commandBus.execute(new MarkShippedCommand(id, dto));
  }

  @MessagePattern({ cmd: 'confirm_delivery' })
  async confirmDelivery(@Payload() data: { id: string; notes?: string }) {
    this.logger.debug(`Confirming delivery for order: ${data.id}`);
    const { id, ...dto } = data;
    return this.commandBus.execute(new ConfirmDeliveryCommand(id, dto));
  }
}
