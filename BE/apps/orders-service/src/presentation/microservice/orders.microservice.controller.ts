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
  GetOrdersQuery,
  GetOrderByIdQuery,
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
}
