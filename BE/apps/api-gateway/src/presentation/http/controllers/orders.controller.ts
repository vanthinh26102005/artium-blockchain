import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MICROSERVICES } from '../../../config';
import { JwtAuthGuard } from '@app/auth';
import {
  CreateOrderDto,
  GetOrdersDto,
  OrderObject,
  UpdateOrderDto,
  MarkShippedDto,
  ConfirmDeliveryDto,
} from '@app/common';
import { sendRpc } from '../utils';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(MICROSERVICES.ORDERS_SERVICE)
    private readonly ordersClient: ClientProxy,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order created successfully', type: OrderObject })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createOrder(@Body() data: CreateOrderDto) {
    return sendRpc(this.ordersClient, { cmd: 'create_order' }, data);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully', type: [OrderObject] })
  async getOrders(@Query() filters: GetOrdersDto) {
    return sendRpc(this.ordersClient, { cmd: 'get_orders' }, filters);
  }

  @Get('on-chain/:onChainOrderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order by on-chain order ID' })
  @ApiParam({
    name: 'onChainOrderId',
    type: 'string',
    description: 'On-chain order ID from smart contract',
  })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully', type: OrderObject })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderByOnChainId(@Param('onChainOrderId') onChainOrderId: string) {
    return sendRpc(this.ordersClient, { cmd: 'get_order_by_onchain_id' }, { onChainOrderId });
  }

  @Get(':id/items')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order items' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order items retrieved' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderItems(@Param('id') id: string) {
    return sendRpc(this.ordersClient, { cmd: 'get_order_items' }, { orderId: id });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully', type: OrderObject })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderById(@Param('id') id: string) {
    return sendRpc(this.ordersClient, { cmd: 'get_order_by_id' }, { id });
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order cancelled', type: OrderObject })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async cancelOrder(@Param('id') id: string, @Body() data: { reason?: string }) {
    return sendRpc(this.ordersClient, { cmd: 'cancel_order' }, { id, ...data });
  }

  @Patch(':id/ship')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark order as shipped (seller action)' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @ApiBody({ type: MarkShippedDto })
  @ApiResponse({ status: 200, description: 'Order marked as shipped', type: OrderObject })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async markShipped(@Param('id') id: string, @Body() data: MarkShippedDto) {
    return sendRpc(this.ordersClient, { cmd: 'mark_shipped' }, { id, ...data });
  }

  @Patch(':id/confirm-delivery')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm delivery (buyer action)' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @ApiBody({ type: ConfirmDeliveryDto })
  @ApiResponse({ status: 200, description: 'Delivery confirmed', type: OrderObject })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async confirmDelivery(@Param('id') id: string, @Body() data: ConfirmDeliveryDto) {
    return sendRpc(this.ordersClient, { cmd: 'confirm_delivery' }, { id, ...data });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({ status: 200, description: 'Order updated successfully', type: OrderObject })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateOrder(@Param('id') id: string, @Body() data: UpdateOrderDto) {
    return sendRpc(this.ordersClient, { cmd: 'update_order' }, { id, ...data });
  }
}
