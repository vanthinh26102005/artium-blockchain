import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  Post,
  Query,
  RawBodyRequest,
  Req,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MICROSERVICES } from '../../../../config';
import { JwtAuthGuard } from '@app/auth';
import {
  CreatePaymentIntentDto,
  ConfirmPaymentIntentDto,
  CreateStripeCustomerDto,
  CreateRefundDto,
  AttachPaymentMethodDto,
} from '@app/common';
import { sendRpc } from '../../utils';
import { RecordEthereumPaymentDto } from './dtos/record-ethereum-payment.dto';
import { GetEthereumQuoteDto } from './dtos/get-ethereum-quote.dto';

@ApiTags('Stripe')
@Controller('payments')
export class PaymentsController {
  constructor(
    @Inject(MICROSERVICES.PAYMENTS_SERVICE)
    private readonly paymentsClient: ClientProxy,
  ) {}

  // ==================== STRIPE OPERATIONS ====================

  @Post('stripe/payment-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe payment intent' })
  @ApiBody({ type: CreatePaymentIntentDto })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createPaymentIntent(
    @Body() data: CreatePaymentIntentDto,
    @Req() req: any,
  ) {
    return sendRpc(
      this.paymentsClient,
      { cmd: 'create_payment_intent' },
      { ...data, userId: req.user?.id },
    );
  }

  @Post('stripe/payment-intent/confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm Stripe payment intent' })
  @ApiBody({ type: ConfirmPaymentIntentDto })
  @ApiResponse({
    status: 200,
    description: 'Payment intent confirmed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payment intent not found' })
  async confirmPaymentIntent(@Body() data: ConfirmPaymentIntentDto) {
    return sendRpc(
      this.paymentsClient,
      { cmd: 'confirm_payment_intent' },
      data,
    );
  }

  @Post('stripe/customers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe customer' })
  @ApiBody({ type: CreateStripeCustomerDto })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Customer already exists' })
  async createStripeCustomer(
    @Body() data: CreateStripeCustomerDto,
    @Req() req: any,
  ) {
    return sendRpc(
      this.paymentsClient,
      { cmd: 'create_stripe_customer' },
      { ...data, userId: req.user?.id },
    );
  }

  @Post('stripe/refunds')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a refund' })
  @ApiBody({ type: CreateRefundDto })
  @ApiResponse({
    status: 201,
    description: 'Refund created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payment intent not found' })
  async createRefund(@Body() data: CreateRefundDto) {
    return sendRpc(this.paymentsClient, { cmd: 'create_refund' }, data);
  }

  @Post('stripe/payment-methods/attach')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Attach payment method to customer' })
  @ApiBody({ type: AttachPaymentMethodDto })
  @ApiResponse({
    status: 200,
    description: 'Payment method attached successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: 'Customer or payment method not found',
  })
  async attachPaymentMethod(@Body() data: AttachPaymentMethodDto) {
    return sendRpc(this.paymentsClient, { cmd: 'attach_payment_method' }, data);
  }

  @Post('stripe/webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Stripe webhook signature',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return sendRpc<{ received: boolean }>(
      this.paymentsClient,
      { cmd: 'stripe_webhook' },
      { body: req.rawBody, signature },
    );
  }

  // ==================== TRANSACTIONS ====================

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my payment transactions' })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTransactions(@Req() req: any) {
    return sendRpc(
      this.paymentsClient,
      { cmd: 'get_transactions' },
      { userId: req.user?.id },
    );
  }

  @Get('transactions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransactionById(@Param('id') id: string, @Req() req: any) {
    const transaction = await sendRpc<{ id: string; userId?: string | null }>(
      this.paymentsClient,
      { cmd: 'get_transaction_by_id' },
      { id },
    );

    if (transaction?.userId !== req.user?.id) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  // ==================== PAYMENT METHODS ====================

  @Get('payment-methods')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my saved payment methods' })
  @ApiResponse({
    status: 200,
    description: 'Payment methods retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPaymentMethods(@Req() req: any) {
    return sendRpc(
      this.paymentsClient,
      { cmd: 'get_payment_methods' },
      { userId: req.user?.id },
    );
  }

  // ==================== ETHEREUM PAYMENTS ====================

  @Post('ethereum')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record Ethereum payment transaction' })
  @ApiBody({ type: RecordEthereumPaymentDto })
  @ApiResponse({ status: 201, description: 'Payment recorded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Transaction already recorded' })
  async recordEthereumPayment(
    @Body() data: RecordEthereumPaymentDto,
    @Req() req: any,
  ) {
    return sendRpc(
      this.paymentsClient,
      { cmd: 'record_ethereum_payment' },
      { ...data, userId: req.user?.id },
    );
  }

  @Get('ethereum/quote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a Sepolia MetaMask quote for checkout' })
  @ApiResponse({
    status: 200,
    description: 'Ethereum quote generated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid quote input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getEthereumQuote(@Query() query: GetEthereumQuoteDto) {
    return sendRpc(
      this.paymentsClient,
      { cmd: 'get_ethereum_quote' },
      { usdAmount: query.usdAmount },
    );
  }
}
