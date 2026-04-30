import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Put,
  Req,
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
import { JwtAuthGuard, Roles, RolesGuard } from '@app/auth';
import {
  ConfirmDeliveryDto,
  CreateOrderDto,
  GetOrdersDto,
  MarkShippedDto,
  OpenDisputeDto,
  OrderObject,
  OrderInvoiceObject,
  OrderInvoiceSourceOrderDto,
  OrdersWorkspaceScope,
  ResolveDisputeDto,
  UpdateOrderDto,
  UserRole,
} from '@app/common';
import { sendRpc } from '../utils';

type OrderItemAccessObject = {
  id?: string | null;
  orderId?: string | null;
  artworkId?: string | null;
  sellerId?: string | null;
  artworkTitle?: string | null;
  artworkImageUrl?: string | null;
  priceAtPurchase?: number | null;
  quantity?: number | null;
  currency?: string | null;
  payoutStatus?: string | null;
};

type AuthorizedOrderObject = OrderObject & {
  updatedAt?: Date | string;
  items?: OrderItemAccessObject[];
};

type OrderInvoiceViewerRole = 'buyer' | 'seller';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(MICROSERVICES.ORDERS_SERVICE)
    private readonly ordersClient: ClientProxy,
    @Inject(MICROSERVICES.PAYMENTS_SERVICE)
    private readonly paymentsClient: ClientProxy,
  ) {}

  private async getAuthorizedOrder(id: string, userId?: string): Promise<AuthorizedOrderObject> {
    const order = await sendRpc<AuthorizedOrderObject>(
      this.ordersClient,
      { cmd: 'get_order_by_id' },
      { id },
    );

    const isBuyer = order.collectorId === userId;
    const isSeller = order.items?.some((item) => item.sellerId === userId) ?? false;

    if (!isBuyer && !isSeller) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  private buildOrderInvoiceSource(
    order: AuthorizedOrderObject,
  ): OrderInvoiceSourceOrderDto {
    if (!order.collectorId) {
      throw new NotFoundException('Order invoice not found');
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      collectorId: order.collectorId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod ?? null,
      paymentTransactionId: order.paymentTransactionId ?? null,
      paymentIntentId: order.paymentIntentId ?? null,
      txHash: order.txHash ?? null,
      onChainOrderId: order.onChainOrderId ?? null,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount ?? 0,
      totalAmount: order.totalAmount,
      currency: order.currency,
      shippingAddress: order.shippingAddress ?? null,
      billingAddress: order.billingAddress ?? null,
      items: (order.items ?? []).map((item) => ({
        id: item.id ?? undefined,
        orderId: item.orderId ?? order.id,
        artworkId: item.artworkId ?? null,
        sellerId: item.sellerId ?? '',
        artworkTitle: item.artworkTitle ?? null,
        artworkImageUrl: item.artworkImageUrl ?? null,
        priceAtPurchase: Number(item.priceAtPurchase ?? 0),
        quantity: Number(item.quantity ?? 1),
        currency: item.currency ?? order.currency,
        payoutStatus: item.payoutStatus ?? null,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt ?? order.createdAt,
      confirmedAt: order.confirmedAt ?? null,
    };
  }

  private getOrderInvoiceViewerRole(
    order: AuthorizedOrderObject,
    userId?: string,
  ): OrderInvoiceViewerRole {
    return order.collectorId === userId ? 'buyer' : 'seller';
  }

  private redactOrderInvoiceForSeller(
    invoice: OrderInvoiceObject,
    sellerId?: string,
  ): OrderInvoiceObject {
    return {
      ...invoice,
      shippingAddress: null,
      billingAddress: null,
      payment: {
        paymentStatus: invoice.payment.paymentStatus,
        paymentMethod: invoice.payment.paymentMethod,
        paymentTransactionId: null,
        paymentIntentId: null,
        txHash: null,
        onChainOrderId: invoice.payment.onChainOrderId ?? null,
      },
      items: invoice.items.filter((item) => item.sellerId === sellerId),
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order created successfully', type: OrderObject })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createOrder(@Body() data: CreateOrderDto, @Req() req: any) {
    return sendRpc(this.ordersClient, { cmd: 'create_order' }, { ...data, buyerId: req.user?.id });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully', type: [OrderObject] })
  async getOrders(@Query() filters: GetOrdersDto, @Req() req: any) {
    const scope = filters.scope ?? OrdersWorkspaceScope.BUYER;
    const userId = req.user?.id;

    return sendRpc(this.ordersClient, { cmd: 'get_orders' }, {
      ...filters,
      scope,
      buyerId: scope === OrdersWorkspaceScope.BUYER ? userId : undefined,
      sellerId: scope === OrdersWorkspaceScope.SELLER ? userId : undefined,
    });
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
  async getOrderByOnChainId(@Param('onChainOrderId') onChainOrderId: string, @Req() req: any) {
    const order = await sendRpc<OrderObject>(
      this.ordersClient,
      { cmd: 'get_order_by_onchain_id' },
      { onChainOrderId },
    );

    return this.getAuthorizedOrder(order.id, req.user?.id);
  }

  @Get(':id/items')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order items' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order items retrieved' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderItems(@Param('id') id: string, @Req() req: any) {
    const order = await this.getAuthorizedOrder(id, req.user?.id);
    return order.items ?? [];
  }

  @Get(':id/invoice')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order invoice preview data' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order invoice retrieved', type: OrderInvoiceObject })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderInvoice(@Param('id') id: string, @Req() req: any) {
    const order = await this.getAuthorizedOrder(id, req.user?.id);
    const viewerRole = this.getOrderInvoiceViewerRole(order, req.user?.id);

    const invoice = await sendRpc<OrderInvoiceObject>(
      this.paymentsClient,
      { cmd: 'get_or_materialize_order_invoice' },
      { order: this.buildOrderInvoiceSource(order) },
    );

    if (viewerRole === 'seller') {
      return this.redactOrderInvoiceForSeller(invoice, req.user?.id);
    }

    return invoice;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully', type: OrderObject })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderById(@Param('id') id: string, @Req() req: any) {
    return this.getAuthorizedOrder(id, req.user?.id);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order cancelled', type: OrderObject })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async cancelOrder(@Param('id') id: string, @Body() data: { reason?: string }, @Req() req: any) {
    return sendRpc(this.ordersClient, { cmd: 'cancel_order' }, { id, userId: req.user?.id, ...data });
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
  async markShipped(@Param('id') id: string, @Body() data: MarkShippedDto, @Req() req: any) {
    return sendRpc(this.ordersClient, { cmd: 'mark_shipped' }, { id, userId: req.user?.id, ...data });
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
  async confirmDelivery(@Param('id') id: string, @Body() data: ConfirmDeliveryDto, @Req() req: any) {
    return sendRpc(this.ordersClient, { cmd: 'confirm_delivery' }, { id, userId: req.user?.id, ...data });
  }

  @Patch(':id/dispute')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Open a dispute (buyer action, within 14 days of shipment)' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @ApiBody({ type: OpenDisputeDto })
  @ApiResponse({ status: 200, description: 'Dispute opened', type: OrderObject })
  @ApiResponse({ status: 400, description: 'Invalid status transition or dispute window expired' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async openDispute(@Param('id') id: string, @Body() data: OpenDisputeDto, @Req() req: any) {
    return sendRpc(this.ordersClient, { cmd: 'open_dispute' }, { id, userId: req.user?.id, ...data });
  }

  @Patch(':id/resolve-dispute')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ARBITER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resolve a dispute (arbiter action)' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order ID' })
  @ApiBody({ type: ResolveDisputeDto })
  @ApiResponse({ status: 200, description: 'Dispute resolved', type: OrderObject })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async resolveDispute(@Param('id') id: string, @Body() data: ResolveDisputeDto) {
    return sendRpc(this.ordersClient, { cmd: 'resolve_dispute' }, { id, ...data });
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
